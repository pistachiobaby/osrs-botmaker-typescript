/**
 * A lightweight, strongly-typed finite state machine.
 */

export type State = string;
export type OnTickReturn = void | number;

export type StateConfig<
	S extends State,
	T extends readonly S[] = readonly S[],
> = {
	transitions: T;
	onEnter?: () => void;
	onExit?: () => void;
	onTick: () => void | number;
	onCheckTransition?: () => T[number] | null | undefined;
};

export type StateDefinition<S extends State> = Record<S, StateConfig<S>>;

export class StateMachine<S extends State> {
	private current: S;
	private readonly states: StateDefinition<S>;
	private _timeout: number | null = null;

	constructor(states: StateDefinition<S>, initial: S) {
		if (!states[initial]) {
			throw new Error(`Initial state "${initial}" is not defined.`);
		}
		this.states = states;
		this.current = initial;

		// Call onEnter for the starting state
		this.states[this.current].onEnter?.();
	}

	get timeout(): number | null {
		return this._timeout;
	}

	/** Get the current state */
	get state(): S {
		return this.current;
	}

	/** Check if we can move from the current state to the target */
	canSwitch(to: S): boolean {
		return this.states[this.current].transitions.includes(to);
	}

	/**
	 * Change to another state.
	 * Throws if invalid transition.
	 * Supports async enter/exit handlers.
	 */
	switch(to: S): void {
		const from = this.current;
		const state = this.states[from];

		if (!state.transitions.includes(to)) {
			throw new Error(`Invalid transition: ${from} → ${to}`);
		}

		// Exit current state
		if (state.onExit) {
			state.onExit();
		}

		this.current = to;

		// Enter new state
		const target = this.states[to];
		if (target.onEnter) {
			target.onEnter();
		}
	}

	tick() {
		const cfg = this.states[this.current];

		if (this._timeout != null) {
			--this._timeout;

			if (this._timeout <= 0) {
				this._timeout = null;
			} else {
				return;
			}
		}

		const tickResult = cfg.onTick();

		if (typeof tickResult === 'number') {
			this._timeout = tickResult;
		}

		const next = cfg.onCheckTransition?.();
		if (next && cfg.transitions.includes(next)) {
			this.switch(next);
			return;
		}
	}
}
