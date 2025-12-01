import { isPlayerBusy } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import { CookingState, createCookingState } from '../cooking-states.js';

const minDistanceToCookingSource = 4;

export default createCookingState(CookingState.WalkToCookingSource)
	.transitions(CookingState.FindCookingSource, CookingState.CookAtSource)
	.onEnter((ctx) => {
		setOverlayStatusText(
			`Walking to Cooking Source (${ctx.cookingSourcePoint?.toString()})`,
		);
	})
	.onTick((ctx) => {
		if (ctx.cookingSourcePoint === null) {
			return [CookingState.FindCookingSource];
		}

		if (isPlayerBusy()) {
			return;
		}

		const player = client.getLocalPlayer();
		const distanceToSource = player
			.getWorldLocation()
			.distanceTo(ctx.cookingSourcePoint);

		if (distanceToSource <= minDistanceToCookingSource) {
			const sources = bot.objects.getTileObjectsWithNames([
				'Stove',
				'Fire',
				'Range',
			]);

			const closestSource = bot.objects.getClosest(sources);
			if (closestSource) {
				ctx.cookingSourceTileObject = closestSource;
				bot.walking.webWalkCancel();
				return [CookingState.CookAtSource];
			} else {
				throw new Error(
					'Walked to cooking source point, but no cooking source found.',
				);
			}
		} else {
			if (!bot.walking.isWebWalking()) {
				bot.walking.webWalkStart(ctx.cookingSourcePoint);
			}
		}

		return;
	})
	.build();
