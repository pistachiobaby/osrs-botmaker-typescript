/* eslint-disable no-mixed-spaces-and-tabs */
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
	terminal?: boolean;

	// Payload type marker (not used at runtime)
	payload?: (payload: P) => void;

	onEnter?: (ctx: C) => void;
	onExit?: (ctx: C) => void;

	onTick: (ctx: C) => AllowedTickReturn<S, C, StateConfig<S, T, C, P, M>>;

	/** Optional check-transition override (still respects allowed transitions) */
	onCheckTransition?: (ctx: C) => T[number] | null | undefined;
};

/** A transition tuple: ['NextState'] */
export type TransitionTuple<S extends string> = [S];

/** Compute the allowed return type of onTick based on transitions */
type AllowedTickReturn<
	ThisState extends string,
	C,
	ThisSC extends StateConfig<ThisState, readonly any[], C, any>,
	T extends readonly ThisState[] = ThisSC['transitions'],
> = void | number | [] | { [K in T[number]]: TransitionTuple<K> }[T[number]];

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

/**
 * Extract context type from a states map.
 * Usage: InferContextFromStates<typeof statesMap>
 */
export type InferContextFromStates<
	M extends Record<string, StateConfig<any, any, any, any>>,
> = M[keyof M] extends StateConfig<any, any, infer Ctx, any> ? Ctx : never;

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
	private globalOnEnter: ((ctx: Ctx) => void) | undefined;
	private globalOnExit: ((ctx: Ctx) => void) | undefined;
	private globalOnStart: ((ctx: Ctx) => void) | undefined;
	private globalOnTick:
		| ((ctx: Ctx, cfg: StateConfig<S, readonly S[], Ctx, any>) => void)
		| undefined;

	/**
	 * Factory method: creates a StateMachine with Ctx inferred from states object.
	 * All states must share the same context type.
	 */
	static create<M extends Record<string, StateConfig<any, any, any, any>>>(
		states: M,
		initial: keyof M & string,
		options?: {
			context?: Partial<InferContextFromStates<M>>;
			onCheckTransitionAfterTick?: boolean;
			onEnter?: (ctx: InferContextFromStates<M>) => void;
			onExit?: (ctx: InferContextFromStates<M>) => void;
			onStart?: (ctx: InferContextFromStates<M>) => void;
			onTick?: (
				ctx: InferContextFromStates<M>,
				cfg: StateConfig<
					keyof M & string,
					readonly (keyof M & string)[],
					InferContextFromStates<M>,
					any
				>,
			) => void;
		},
	) {
		type Ctx = InferContextFromStates<M>;
		type S = keyof M & string;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return new StateMachine<S, Ctx, M>(
			states as M & Record<S, StateConfig<S, any, Ctx, any>>,
			initial as S,
			options,
		);
	}

	constructor(
		states: M,
		initial: S,
		private options?: {
			/**
			 * Partial context used as overrides for the machine's context. Only
			 * specified properties will override defaults; unspecified properties
			 * remain undefined on the provided object. The final `this.context`
			 * is typed as `Ctx` for handlers, but callers may pass a partial
			 * object when constructing the machine.
			 */
			context?: Partial<Ctx>;
			onCheckTransitionAfterTick?: boolean;
			onEnter?: (ctx: Ctx) => void;
			onExit?: (ctx: Ctx) => void;
			onStart?: (ctx: Ctx) => void;
			onTick?: (
				ctx: Ctx,
				cfg: StateConfig<S, readonly S[], Ctx, any>,
			) => void;
		},
	) {
		if (!states[initial]) {
			throw new Error(`Initial state "${initial}" is not defined.`);
		}

		this.states = states;
		this.current = initial;
		this.context = { ...options?.context } as Ctx;
		this.globalOnEnter = options?.onEnter;
		this.globalOnExit = options?.onExit;
		this.globalOnStart = options?.onStart;
		this.globalOnTick = options?.onTick;

		this.globalOnStart?.(this.context);
		this.states[this.current].onEnter?.(this.context);
		this.globalOnEnter?.(this.context);
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
	switch<K extends S>(to: K) {
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
		this.globalOnExit?.(this.context);

		this.current = to;
		const nextCfg = this.states[to];

		nextCfg.onEnter?.(this.context);
		this.globalOnEnter?.(this.context);
	}

	tick(): void | [] {
		const cfg = this.states[this.current];
		this.globalOnTick?.(this.context, cfg);

		// Handle timeout if set
		if (this.timeoutCounter != null) {
			this.timeoutCounter -= 1;

			if (this.timeoutCounter > 0) return;
			this.timeoutCounter = null;
		}

		// TODO: onCheckTransition could tick right after transitioning, that way we're not wasting ticks.
		if (!this.options?.onCheckTransitionAfterTick) {
			const next = cfg.onCheckTransition?.(this.context) as
				| void
				| [S]
				| [];

			if (next && Array.isArray(next)) {
				if (next.length === 0) {
					return [];
				}

				if (
					Array.isArray(cfg.transitions) &&
					(cfg.transitions as string[]).includes(next[0])
				) {
					this.switch(next[0]);
					return;
				}
			}
		}

		try {
			const result = cfg.onTick(this.context);

			// Handle numeric timeout
			if (typeof result === 'number') {
				this.timeoutCounter = result;
				return;
			}

			// Handle transition tuple: [nextState]
			if (Array.isArray(result)) {
				if (result.length > 0) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const [to] = result;
					this.switch(to);
				} else {
					return []; // empty array signals machine completion
				}

				return;
			}
		} catch (error) {
			if (error instanceof Error) {
				bot.printGameMessage(`StateMachine Error in ${this.current}`);
				bot.printLogMessage(`${error.message} : ${error.stack}`);
			}

			bot.terminate();
		}

		if (this.options?.onCheckTransitionAfterTick) {
			const next = cfg.onCheckTransition?.(this.context) as void | [S];

			if (
				next &&
				Array.isArray(next) &&
				Array.isArray(cfg.transitions) &&
				(cfg.transitions as string[]).includes(next[0])
			) {
				this.switch(next[0]);
				return;
			}
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
	T extends NoTransitions | SomeTransitions<any>, // transitions
> {
	constructor(
		private name: Name,
		private _transitions: T,
		private onEnterFn?: (ctx: C) => void,
		private onExitFn?: (ctx: C) => void,
		private onTickFn?: (ctx: C) => any,
		private onCheckFn?: ((ctx: C) => any) | undefined,
		private _terminal?: boolean,
	) {}

	terminal(terminal = true) {
		return new StateBuilder<S, Name, C, T>(
			this.name,
			this._transitions,
			this.onEnterFn,
			this.onExitFn,
			this.onTickFn,
			this.onCheckFn,
			terminal,
		);
	}

	// Optional transitions
	transitions<const To extends readonly S[]>(...targets: To) {
		return new StateBuilder<S, Name, C, SomeTransitions<To>>(
			this.name,
			{ has: true, to: targets },
			this.onEnterFn,
			this.onExitFn,
			this.onTickFn,
			undefined,
		);
	}

	onEnter(fn: (ctx: C) => void) {
		return new StateBuilder<S, Name, C, T>(
			this.name,
			this._transitions,
			fn,
			this.onExitFn,
			this.onTickFn,
			this.onCheckFn,
		);
	}

	onExit(fn: (ctx: C) => void) {
		return new StateBuilder<S, Name, C, T>(
			this.name,
			this._transitions,
			this.onEnterFn,
			fn,
			this.onTickFn,
			this.onCheckFn,
		);
	}

	onTick(
		fn: (
			ctx: C,
		) =>
			| void
			| number
			| AllowedTickReturn<
					Name,
					C,
					StateConfig<
						Name,
						T extends { to: infer To } ? To : readonly [],
						C,
						any
					>
			  >,
	) {
		return new StateBuilder<S, Name, C, T>(
			this.name,
			this._transitions,
			this.onEnterFn,
			this.onExitFn,
			fn,
			this.onCheckFn,
		);
	}

	onCheckTransition(
		this: StateBuilder<S, Name, C, SomeTransitions<any>>,
		fn: (
			ctx: C,
		) => void | AllowedTickReturn<
			Name,
			C,
			StateConfig<
				Name,
				T extends { to: infer To } ? To : readonly [],
				C,
				any
			>
		>,
	) {
		return new StateBuilder<S, Name, C, SomeTransitions<T['to']>>(
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
			terminal: this._terminal,
		};
	}
}

export function makeStateBuilder<S extends string, C>() {
	return function createState<Name extends S>(name: Name) {
		return new StateBuilder<S, Name, C, NoTransitions>(name, {
			has: false,
			to: [],
		});
	};
}
