import { makeStateBuilder } from '../../../state-machine.js';

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

export interface CookingContext {
	lastInteractionTick: number;
}

export const createCookingState = makeStateBuilder<
	CookingStates,
	CookingContext
>();
