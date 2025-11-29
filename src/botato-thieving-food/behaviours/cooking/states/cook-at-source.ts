import { isPlayerBusy } from '../../../../utils.js';
import { CookingState, createCookingState } from '../cooking-states.js';

export default createCookingState(CookingState.CookAtSource)
	.transitions(CookingState.FindCookingSource)
	.onTick((ctx) => {
		if (ctx.cookingSourceTileObject === null) {
			return [CookingState.FindCookingSource];
		}

		if (isPlayerBusy()) {
			return;
		}

		if (!bot.inventory.containsAnyIds([2134])) {
			if (bot.inventory.containsAnyIds([2146])) {
				bot.inventory.interactWithIds([2146], ['Drop']);
			} else if (bot.inventory.containsAnyIds([2142])) {
				bot.terminate();
				return; // EXIT MACHINE?
			}

			throw new Error(
				'Unexpected state: No raw food in inventory to cook.',
			);
		}

		if (client.getWidget(17694735)) {
			bot.widgets.interactSpecifiedWidget(17694735, 1, 57, -1);
			return 3;
		}

		bot.inventory.itemOnObjectWithIds(2134, ctx.cookingSourceTileObject);
		return 1;
	})
	.build();
