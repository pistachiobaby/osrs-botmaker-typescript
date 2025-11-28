/* eslint-disable unicorn/prevent-abbreviations */
/**
 * A lightweight, strongly-typed finite state machine.
 */

export type State = string;
export type OnTickReturn = void | number;

/**
 * StateConfig:
 * S = state name
 * T = allowed transition states (tuple literal)
 * C = context type
 * P = payload for ENTERING this state
 * M = the entire map of state configs (filled via defineStates for inference)
 */
export type StateConfig<
	S extends string,
	T extends readonly S[],
	C,
	P,
	M extends Record<S, StateConfig<S, readonly S[], C, any>> = any,
> = {
	transitions: T;

	// Payload type marker (not used at runtime)
	payload?: (payload: P) => void;

	onEnter?: (ctx: C, payload: P) => void;
	onExit?: (ctx: C) => void;

	onTick: (ctx: C) => AllowedTickReturn<S, C, M, StateConfig<S, T, C, P, M>>;

	/** Optional check-transition override (still respects allowed transitions) */
	onCheckTransition?: (ctx: C) => T[number] | null | undefined;
};

/** A transition tuple: ['NextState', PayloadForNextState] */
export type TransitionTuple<S extends string, P> = [S, P];

/** Extract the payload type of a StateConfig */
type PayloadOf<SC> = SC extends StateConfig<any, any, any, infer P> ? P : never;

/** Compute the allowed return type of onTick based on transitions */
type AllowedTickReturn<
	ThisState extends string,
	C,
	M extends Record<string, StateConfig<any, any, any, any>>,
	ThisSC extends StateConfig<ThisState, readonly any[], C, any>,
	T extends readonly ThisState[] = ThisSC['transitions'],
> =
	| void
	| number
	| { [K in T[number]]: TransitionTuple<K, PayloadOf<M[K]>> }[T[number]];

/** Full state definition */
export type StateDefinition<
	S extends string,
	C,
	M extends Record<S, StateConfig<S, any, C, any>>,
> = M;

export function defineStates<
	M extends Record<string, StateConfig<any, any, any, any>>,
>(map: M) {
	// Extract union of state names
	type S = keyof M & string;

	// Extract the context type from each state
	type C = M[S] extends StateConfig<any, any, infer Ctx, any> ? Ctx : never;

	// Verify all states share same context:
	//   If not, C becomes `never` and typing breaks safely.
	return map as StateDefinition<
		S,
		C,
		{
			[K in S]: M[K] extends StateConfig<any, any, C, any> ? M[K] : never;
		}
	>;
}

export function defineStateConfig<
	Name extends string,
	T extends readonly Name[],
	P,
>(
	name: Name,
	config: Omit<StateConfig<Name, T, any, P>, 'transitions'> & {
		transitions: T;
	},
) {
	return config as StateConfig<Name, T, any, P>;
}

// ============================================================================
//  StateMachine Class
// ============================================================================

export class StateMachine<
	S extends string,
	Ctx,
	M extends Record<S, StateConfig<S, any, Ctx, any>>,
> {
	private current: S;
	private readonly states: M;
	private readonly context: Ctx;
	private timeoutCounter: number | null = null;

	constructor(states: M, initial: S, context: Ctx) {
		if (!states[initial]) {
			throw new Error(`Initial state "${initial}" is not defined.`);
		}

		this.states = states;
		this.current = initial;
		this.context = context;

		this.states[this.current].onEnter?.(this.context, undefined as any);
	}

	get state(): S {
		return this.current;
	}

	get ctx(): Ctx {
		return this.context;
	}

	get timeout(): number | null {
		return this.timeoutCounter;
	}

	canSwitch(to: S): boolean {
		const cfg = this.states[this.current] as StateConfig<
			S,
			readonly S[],
			Ctx,
			any
		>;
		return cfg.transitions.includes(to);
	}

	/**
	 * Strongly-typed switch:
	 * - Ensures `to` is valid from this state
	 * - Ensures payload matches the target state's expected payload type
	 */
	switch<K extends S>(
		to: K,
		payload: M[K] extends StateConfig<any, any, any, infer P> ? P : never,
	) {
		const fromCfg = this.states[this.current] as StateConfig<
			S,
			readonly S[],
			Ctx,
			any
		>;

		if (!fromCfg.transitions.includes(to)) {
			throw new Error(`Invalid transition: ${this.current} → ${to}`);
		}

		fromCfg.onExit?.(this.context);

		this.current = to;
		const nextCfg = this.states[to];

		nextCfg.onEnter?.(this.context, payload);
	}

	tick() {
		const cfg = this.states[this.current];

		// Handle timeout if set
		if (this.timeoutCounter != null) {
			this.timeoutCounter -= 1;
			if (this.timeoutCounter > 0) return;
			this.timeoutCounter = null;
		}

		const result = cfg.onTick(this.context);

		// Handle numeric timeout
		if (typeof result === 'number') {
			this.timeoutCounter = result;
			return;
		}

		// Handle transition tuple: [nextState, payload]
		if (Array.isArray(result)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const [to, payload] = result;
			this.switch(
				to,
				payload as M[typeof to] extends StateConfig<
					any,
					any,
					any,
					infer P
				>
					? P
					: never,
			);
			return;
		}

		// Optionally check transitions if user wants
		const next = cfg.onCheckTransition?.(this.context) as
			| S
			| null
			| undefined;
		if (
			next &&
			Array.isArray(cfg.transitions) &&
			(cfg.transitions as readonly string[]).includes(next)
		) {
			this.switch(
				next,
				undefined as M[typeof next] extends StateConfig<
					any,
					any,
					any,
					infer P
				>
					? P
					: never,
			);
		}
	}
}

type NoTransitions = {
	has: false;
	to: readonly [];
};

type SomeTransitions<To extends readonly string[]> = {
	has: true;
	to: To;
};

class StateBuilder<
	S extends string, // all valid states
	Name extends S, // this state's name
	C, // context
	P, // payload type
	T extends NoTransitions | SomeTransitions<any>, // transitions
> {
	constructor(
		private name: Name,
		private _transitions: T,
		private onEnterFn?: (ctx: C, payload: P) => void,
		private onExitFn?: (ctx: C) => void,
		private onTickFn?: (ctx: C) => any,
		private onCheckFn?: ((ctx: C) => any) | undefined,
	) {}

	// Optional payload
	payload<PP>() {
		return new StateBuilder<S, Name, C, PP, T>(
			this.name,
			this._transitions,
			undefined,
			this.onExitFn,
			this.onTickFn,
			this.onCheckFn,
		);
	}

	// Optional transitions
	transitions<const To extends readonly S[]>(...targets: To) {
		return new StateBuilder<S, Name, C, P, SomeTransitions<To>>(
			this.name,
			{ has: true, to: targets },
			this.onEnterFn,
			this.onExitFn,
			this.onTickFn,
			undefined,
		);
	}

	onEnter(fn: (ctx: C, payload: P) => void) {
		return new StateBuilder<S, Name, C, P, T>(
			this.name,
			this._transitions,
			fn,
			this.onExitFn,
			this.onTickFn,
			this.onCheckFn,
		);
	}

	onExit(fn: (ctx: C) => void) {
		return new StateBuilder<S, Name, C, P, T>(
			this.name,
			this._transitions,
			this.onEnterFn,
			fn,
			this.onTickFn,
			this.onCheckFn,
		);
	}

	onTick(fn: (ctx: C) => void | number | TransitionTuple<S, any>) {
		return new StateBuilder<S, Name, C, P, T>(
			this.name,
			this._transitions,
			this.onEnterFn,
			this.onExitFn,
			fn,
			this.onCheckFn,
		);
	}

	onCheckTransition(
		this: StateBuilder<S, Name, C, P, SomeTransitions<any>>,
		fn: (ctx: C) => T['to'][number] | null | undefined,
	) {
		return new StateBuilder<S, Name, C, P, SomeTransitions<T['to']>>(
			this.name,
			this._transitions,
			this.onEnterFn,
			this.onExitFn,
			this.onTickFn,
			fn,
		);
	}

	build() {
		return {
			name: this.name,
			transitions: this._transitions.to as T extends { to: infer To }
				? To
				: never,
			onEnter: this.onEnterFn,
			onExit: this.onExitFn,
			onTick: this.onTickFn!,
			onCheckTransition: this.onCheckFn,
		};
	}
}

export function makeStateBuilder<S extends string, C>() {
	return function createState<Name extends S>(name: Name) {
		return new StateBuilder<S, Name, C, void, NoTransitions>(name, {
			has: false,
			to: [],
		});
	};
}
