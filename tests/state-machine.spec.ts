import { expect, test, describe } from 'vitest';
import {
	defineStates,
	makeStateBuilder,
	StateDefinition,
	StateMachine,
} from '../src/state-machine.js';

describe('state-machine', () => {
	test('can instantiate a state machine', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		expect(sm).toBeDefined();
	});

	test('can transition to another state', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.transitions('Walk')
					.onTick(() => {})
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		sm.switch('Walk');
	});

	test('returns true when checking if can transition to valid state', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.transitions('Walk')
					.onTick(() => {})
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		expect(sm.canSwitch('Walk')).toBe(true);
	});

	test('throws an error when transitioning to an invalid state', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.onTick(() => {})
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		expect(() => sm.switch('Walk')).toThrowError();
	});

	test('can add a timeout when returning a number from onTick', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.onTick(() => 5)
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		expect(sm.timeout).toBeNull();

		sm.tick();

		expect(sm.timeout).toBe(5);
	});

	test('onTick decrements timeout when it is not 0', () => {
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.onTick(() => 5)
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
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
		const builder = makeStateBuilder<'Idle' | 'Walk', object>();

		const sm = StateMachine.create(
			{
				Idle: builder('Idle')
					.transitions('Walk')
					.onCheckTransition(() => ['Walk'])
					.onTick(() => {})
					.build(),
				Walk: builder('Walk')
					.onTick(() => {})
					.build(),
			},
			'Idle',
		);

		expect(sm.state).toEqual('Idle');

		sm.tick();

		expect(sm.state).toEqual('Walk');
	});

	test('context is brought along through transitions', () => {
		interface ContextType {
			foo?: string;
		}

		const definitions = defineStates({
			Idle: {
				transitions: ['Walking'],
				onTick: (ctx: ContextType) => {
					ctx.foo = 'bar';
					return ['Walking'];
				},
			},
			Walking: {
				transitions: [],
				onTick: () => {},
			},
		});

		const sm = StateMachine.create(definitions, 'Idle');
		expect(sm.ctx.foo).toBeUndefined();

		sm.tick();

		expect(sm.state).toEqual('Walking');
		expect(sm.ctx.foo).toEqual('bar');
	});

	test('state builder works', () => {
		const TestState = {
			Idle: 'Idle',
			Walk: 'Walk',
		} as const;

		type TestStates = (typeof TestState)[keyof typeof TestState];

		interface Context {
			foo: string;
		}

		const builder = makeStateBuilder<TestStates, Context>();

		const IdleState = builder('Idle')
			.transitions('Walk')
			.onCheckTransition(() => ['Walk'])
			.onTick(() => {})
			.build();

		const WalkState = builder('Walk')
			.onTick(() => [])
			.build();

		const machine = StateMachine.create(
			{
				[TestState.Idle]: IdleState,
				[TestState.Walk]: WalkState,
			},
			'Idle',
		);

		expect(machine.state).toEqual(TestState.Idle);
		machine.tick();
		expect(machine.state).toEqual(TestState.Walk);
	});
});
