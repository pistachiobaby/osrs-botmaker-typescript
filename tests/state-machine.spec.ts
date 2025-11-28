import { expect, test, describe } from 'vitest';
import { StateDefinition, StateMachine } from '../src/state-machine.js';

describe('state-machine', () => {
	test('can instantiate a state machine', () => {
		const sm = new StateMachine<
			'Idle' | 'Walking',
			Record<string, never>,
			any
		>(
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
			{},
		);

		expect(sm).toBeDefined();
	});

	test('can transition to another state', () => {
		const sm = new StateMachine<
			'Idle' | 'Walking',
			Record<string, never>,
			any
		>(
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
			{},
		);

		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		sm.switch('Walking', undefined as any);
	});

	test('returns true when checking if can transition to valid state', () => {
		const sm = new StateMachine<
			'Idle' | 'Walking',
			Record<string, never>,
			any
		>(
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
			{},
		);

		expect(sm.canSwitch('Walking')).toBe(true);
	});

	test('throws an error when transitioning to an invalid state', () => {
		const sm = new StateMachine<
			'Idle' | 'Walking',
			Record<string, never>,
			any
		>(
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
			{},
		);

		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		expect(() => sm.switch('Walking', undefined as any)).toThrowError();
	});

	test('can add a timeout when returning a number from onTick', () => {
		const sm = new StateMachine<'Idle', Record<string, never>, any>(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return 5;
					},
				},
			},
			'Idle',
			{},
		);

		expect(sm.timeout).toBeNull();

		sm.tick();

		expect(sm.timeout).toBe(5);
	});

	test('onTick decrements timeout when it is not 0', () => {
		const sm = new StateMachine<'Idle', Record<string, never>, any>(
			{
				Idle: {
					transitions: [],
					onTick: () => {
						return 5;
					},
				},
			},
			'Idle',
			{},
		);

		expect(sm.timeout).toBeNull();

		sm.tick();

		expect(sm.timeout).toBe(5);

		sm.tick();

		expect(sm.timeout).toBe(4);
	});

	test('can auto transition to next state', () => {
		type State = 'Idle' | 'Walking';

		const definitions: StateDefinition<
			State,
			Record<string, never>,
			any
		> = {
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

		const sm = new StateMachine<State, Record<string, never>, any>(
			definitions,
			'Idle',
			{},
		);
		expect(sm.state).toEqual('Idle');

		sm.tick();

		expect(sm.state).toEqual('Walking');
	});
});
