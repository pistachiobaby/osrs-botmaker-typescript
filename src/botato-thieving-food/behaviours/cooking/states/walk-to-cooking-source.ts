import { CookingState, createCookingState } from '../index.js';

export type WalkToCookingSourcePayload = {
	cookingSourceTileObject: net.runelite.api.TileObject;
};

export default createCookingState(CookingState.WalkToCookingSource)
	.transitions('Cooking.CookAtSource')
	.payload<WalkToCookingSourcePayload>()
	.onTick(() => {
		return [CookingState.CookAtSource, {}];
	})
	.build();
