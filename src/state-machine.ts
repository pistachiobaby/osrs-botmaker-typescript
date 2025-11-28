/* eslint-disable unicorn/prevent-abbreviations */
/**
 * A lightweight, strongly-typed finite state machine.
 */

import {
	setCurrentOverlayStateText,
	setOverlayNextStateText,
} from './botato-thieving-food/overlay.js';

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
		return this.states[this.current].transitions.includes(to);
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
		const fromCfg = this.states[this.current];

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
			const [to, payload] = result;
			this.switch(to, payload as any);
			return;
		}

		// Optionally check transitions if user wants
		const next = cfg.onCheckTransition?.(this.context);
		if (next && cfg.transitions.includes(next)) {
			this.switch(next, undefined as any);
		}
	}
}

// ============================================================================
//   makeStateBuilder — factory tied to specific S (state union) and C (context)
// ============================================================================

export function makeStateBuilder<S extends string, C>() {
	return function createState<Name extends S>(name: Name) {
		return {
			transitions<To extends S>(...targets: readonly To[]) {
				return {
					payload<P = void>() {
						return new StateBuilder<Name, To, C, P>(name, targets);
					},
					noPayload() {
						return new StateBuilder<Name, To, C, void>(
							name,
							targets,
						);
					},
				};
			},
			noTransitions: {
				payload<P = void>() {
					return new StateBuilder<Name, never, C, P>(name, []);
				},
				noPayload() {
					return new StateBuilder<Name, never, C, void>(name, []);
				},
			},
		};
	};
}

class StateBuilder<Name extends string, To extends Name, C, P> {
	constructor(
		private name: Name,
		private transitions: readonly To[],
	) {}

	private _onEnter?: (ctx: C, payload: P) => void;
	private _onExit?: (ctx: C) => void;
	private _onTick?: (ctx: C) => any;
	private _onCheckTransition?: (ctx: C) => To | null | undefined;
	private _payloadMarker?: (p: P) => void;

	onEnter(fn: (ctx: C, payload: P) => void) {
		this._onEnter = fn;
		return this;
	}
	onExit(fn: (ctx: C) => void) {
		this._onExit = fn;
		return this;
	}
	onTick(fn: (ctx: C) => any) {
		this._onTick = fn;
		return this;
	}
	onCheckTransition(fn: (ctx: C) => To | null | undefined) {
		this._onCheckTransition = fn;
		return this;
	}

	build() {
		// Build a syntactically correct raw StateConfig
		return {
			transitions: this.transitions,
			payload: this._payloadMarker,
			onEnter: this._onEnter,
			onExit: this._onExit,
			onTick: this._onTick!,
			onCheckTransition: this._onCheckTransition,
		} as StateConfig<Name, readonly To[], C, P>;
	}
}
