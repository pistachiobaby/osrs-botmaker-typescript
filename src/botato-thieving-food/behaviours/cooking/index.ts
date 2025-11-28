import {
	defineStates,
	makeStateBuilder,
	StateMachine,
} from '../../../state-machine.js';
import cookAtSource from './states/cook-at-source.js';
import findCookingSource from './states/find-cooking-source.js';
import walkToCookingSource from './states/walk-to-cooking-source.js';

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

interface CookingContext {
	lastInteractionTick: number;
}

export const createCookingState = makeStateBuilder<
	CookingStates,
	CookingContext
>();

export default new StateMachine(
	defineStates({
		[CookingState.FindCookingSource]: findCookingSource,
		[CookingState.WalkToCookingSource]: walkToCookingSource,
		[CookingState.CookAtSource]: cookAtSource,
	}),
	CookingState.FindCookingSource,
	{
		lastInteractionTick: 0,
	},
);
