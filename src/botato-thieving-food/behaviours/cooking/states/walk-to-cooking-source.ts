import { isPlayerBusy } from '../../../../utils.js';
import { CookingState, createCookingState } from '../cooking-states.js';

const minDistanceToCookingSource = 4;

export default createCookingState(CookingState.WalkToCookingSource)
	.transitions(CookingState.FindCookingSource, CookingState.CookAtSource)
	.onTick((ctx) => {
		if (isPlayerBusy()) {
			return;
		}

		if (ctx.cookingSourceTileObject) {
			const player = client.getLocalPlayer();
			const distanceToSource = player
				.getWorldLocation()
				.distanceTo(ctx.cookingSourceTileObject.getWorldLocation());

			if (bot.walking.isWebWalking()) {
				if (distanceToSource <= minDistanceToCookingSource) {
					bot.walking.webWalkCancel();
					return [CookingState.CookAtSource];
				}
			} else {
				if (distanceToSource > minDistanceToCookingSource) {
					bot.walking.webWalkStart(
						ctx.cookingSourceTileObject.getWorldLocation(),
					);
				}
			}

			return;
		} else {
			return [CookingState.FindCookingSource];
		}
	})
	.build();
