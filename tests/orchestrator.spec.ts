import { describe, expect, test } from 'vitest';
import { Orchestrator } from '../src/orchestrator.js';
import { StateMachine } from '../src/state-machine.js';

describe('orchestrator', () => {
	test('can instantiate an orchestrator', () => {
		const orchestrator = new Orchestrator(() => {});

		expect(orchestrator).toBeDefined();
	});

	test('orchestrator starts immediately with a machine if provided by next function', () => {
		const machine = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {},
				},
			},
			'Idle',
		);

		const orchestrator = new Orchestrator(() => machine);
		expect(orchestrator.active).toBe(machine);
	});

	test('orchestrator ticks the active machine', () => {
		let didMachineTick = false;
		const machine = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						didMachineTick = true;
					},
				},
			},
			'Idle',
		);

		const orchestrator = new Orchestrator(() => machine);
		orchestrator.tick();

		expect(didMachineTick).toBe(true);
	});

	test('orchestrator can tick over to another machine', () => {
		const machineB = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return [];
					},
				},
			},
			'Idle',
		);

		const machineA = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return [];
					},
				},
			},
			'Idle',
		);

		let nextMachine = false;
		const orchestrator = new Orchestrator(() => {
			if (nextMachine) {
				return machineB;
			}

			nextMachine = true;
			return machineA;
		});

		expect(orchestrator.active).toBe(machineA);
		orchestrator.tick();

		expect(orchestrator.active).toBe(machineB);
		orchestrator.tick();
		expect(orchestrator.active).toBe(machineB); // Should still be machineB
	});

	test('orchestrator can tick over to no machine', () => {
		const machine = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return [];
					},
				},
			},
			'Idle',
		);

		let returned = false;
		const orchestrator = new Orchestrator(() => {
			if (!returned) {
				returned = true;
				return machine;
			}
		});

		expect(orchestrator.active).toBe(machine);

		orchestrator.tick();

		expect(orchestrator.active).toBeUndefined();
	});

	test('orchestrator machines tick independently', () => {
		let machineTicks = 0;
		const machine = StateMachine.create(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						machineTicks++;
					},
				},
			},
			'Idle',
		);

		const orchestrator = new Orchestrator(() => {
			return machine;
		});

		expect(orchestrator.active).toBe(machine);
		expect(machineTicks).toBe(0);

		for (let i = 0; i < 5; i++) {
			orchestrator.tick();
		}

		expect(machineTicks).toBe(5);
	});
});
