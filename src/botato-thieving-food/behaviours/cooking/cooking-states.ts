/* eslint-disable @typescript-eslint/no-unsafe-call */
import { makeStateBuilder } from '../../../state-machine.js';
import { imports } from '../../../utils.js';

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

export interface CookingContext {
	cookingSourceTileObject: net.runelite.api.TileObject | null;
	lastInteractionTick: number | null;
}

export const createCookingState = makeStateBuilder<
	CookingStates,
	CookingContext
>();
