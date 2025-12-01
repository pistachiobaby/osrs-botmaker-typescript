import { setOverlayStatusText } from '../../../overlay.js';
import {
	COOKING_POINTS,
	CookingState,
	createCookingState,
} from '../cooking-states.js';
import { getClosestPoint } from '../../../../utils.js';

export default createCookingState(CookingState.FindCookingSource)
	.transitions(CookingState.WalkToCookingSource)
	.onEnter(() => {
		setOverlayStatusText('Scanning for Cooking Source...');
	})
	.onTick((ctx) => {
		const closestCookingSource = getClosestPoint(
			client.getLocalPlayer().getWorldLocation(),
			COOKING_POINTS,
		);

		ctx.cookingSourcePoint = closestCookingSource;

		return [CookingState.WalkToCookingSource];
	})
	.build();
