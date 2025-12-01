/* eslint-disable @typescript-eslint/no-unsafe-call */
import { makeStateBuilder } from '../../../state-machine.js';
import { WorldPoint } from '../../../imports.js';

export const COOKING_POINTS = [
	new WorldPoint(2969, 3210, 0), // Hengel Range
	new WorldPoint(2967, 3204, 0), // Witch House Fireplace
	new WorldPoint(3017, 3238, 0), // Port Sarim Range
];

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

export interface CookingContext {
	cookingSourcePoint: net.runelite.api.coords.WorldPoint | null;
	cookingSourceTileObject: net.runelite.api.TileObject | null;
	lastInteractionTick: number | null;
}

export const createCookingState = makeStateBuilder<
	CookingStates,
	CookingContext
>();
