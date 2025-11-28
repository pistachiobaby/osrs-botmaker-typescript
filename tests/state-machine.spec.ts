import { expect, test, describe } from 'vitest';
import { StateDefinition, StateMachine } from '../src/state-machine.js';

describe('state-machine', () => {
	test('can instantiate a state machine', () => {
		const sm = new StateMachine<'Idle' | 'Walking'>(
			{
				Idle: {
					transitions: [],
					onTick: () => {},
				},
				Walking: {
					transitions: [],
					onTick: () => {},
				},
			},
			'Idle',
		);

		expect(sm).toBeDefined();
	});

	test('can transition to another state', () => {
		const sm = new StateMachine<'Idle' | 'Walking'>(
			{
				Idle: {
					transitions: ['Walking'],
					onTick: () => {},
				},
				Walking: {
					transitions: [],
					onTick: () => {},
				},
			},
			'Idle',
		);

		sm.switch('Walking');
	});

	test('returns true when checking if can transition to valid state', () => {
		const sm = new StateMachine<'Idle' | 'Walking'>(
			{
				Idle: {
					transitions: ['Walking'],
					onTick: () => {},
				},
				Walking: {
					transitions: [],
					onTick: () => {},
				},
			},
			'Idle',
		);

		expect(sm.canSwitch('Walking')).toBe(true);
	});

	test('throws an error when transitioning to an invalid state', () => {
		const sm = new StateMachine<'Idle' | 'Walking'>(
			{
				Idle: {
					transitions: [],
					onTick: () => {},
				},
				Walking: {
					transitions: [],
					onTick: () => {},
				},
			},
			'Idle',
		);

		expect(() => sm.switch('Walking')).toThrowError();
	});

	test('can add a timeout when returning a number from onTick', () => {
		const sm = new StateMachine<'Idle'>(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return 5;
					},
				},
			},
			'Idle',
		);

		expect(sm.timeout).toBeNull();

		sm.tick();

		expect(sm.timeout).toBe(5);
	});

	test('onTick decrements timeout when it is not 0', () => {
		const sm = new StateMachine<'Idle'>(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return 5;
					},
				},
			},
			'Idle',
		);

		expect(sm.timeout).toBeNull();

		sm.tick();

		expect(sm.timeout).toBe(5);

		sm.tick();

		expect(sm.timeout).toBe(4);
	});

	test('can auto transition to next state', () => {
		type State = 'Idle' | 'Walking';

		const definitions: StateDefinition<State> = {
			Idle: {
				transitions: ['Walking'],
				onTick: () => {},
				onCheckTransition: () => {
					return 'Walking';
				},
			},
			Walking: {
				transitions: [],
				onTick: () => {},
			},
		};

		const sm = new StateMachine(definitions, 'Idle');
		expect(sm.state).toEqual('Idle');

		sm.tick();

		expect(sm.state).toEqual('Walking');
	});
});
