import { StateMachine } from './state-machine.js';

export class Orchestrator<Machine extends StateMachine<any, any, any>> {
	private stack: Machine[] = [];
	private next?: (current: Machine | null) => Machine | void;

	constructor(next?: (current: Machine | null) => Machine | void) {
		this.next = next;
		this.decideNextMachine();
	}

	push(machine: Machine) {
		this.stack.push(machine);
	}

	pop() {
		return this.stack.pop();
	}

	get active() {
		return this.stack[this.stack.length - 1];
	}

	tick() {
		if (!this.active) {
			return;
		}

		const result = this.active.tick();

		if (Array.isArray(result) && result.length === 0) {
			this.pop();
			this.decideNextMachine();
		} else {
			return;
		}
	}

	decideNextMachine() {
		if (!this.next) {
			return;
		}

		const result = this.next(this.active ?? null);

		if (result) {
			this.push(result);
		}
	}
}
