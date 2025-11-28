import { defineStates, makeStateBuilder } from '../../../state-machine.js';
import findCookingSource from './find-cooking-source.js';

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

interface CookingContext {
	lastInteractionTick: number;
}

export type CookAtSourcePayload = {
	cookingSourceTileObject: net.runelite.api.TileObject;
};

export const createCookingState = makeStateBuilder<
	CookingStates,
	CookingContext
>();

export default defineStates({
	findCookingSource,
});
