import {
	BURNT_FOOD_ITEM_IDS,
	COOKED_FOOD_ITEM_IDS,
	filterInventoryIds,
	getRandomInt,
	isPlayerBusy,
	RAW_FOOD_ITEM_IDS,
} from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import { CookingState, createCookingState } from '../cooking-states.js';

export default createCookingState(CookingState.CookAtSource)
	.transitions(CookingState.FindCookingSource)
	.onEnter((ctx) => {
		setOverlayStatusText(
			`Cooking at Source (${ctx.cookingSourcePoint?.toString()})`,
		);
	})
	.onTick((ctx) => {
		if (ctx.cookingSourceTileObject === null) {
			return [CookingState.FindCookingSource];
		}

		if (isPlayerBusy()) {
			return;
		}

		// Do we have any raw food to cook?
		if (!bot.inventory.containsAnyIds(RAW_FOOD_ITEM_IDS)) {
			if (bot.inventory.containsAnyIds(BURNT_FOOD_ITEM_IDS)) {
				bot.inventory.interactWithIds(BURNT_FOOD_ITEM_IDS, ['Drop']);
			} else if (bot.inventory.containsAnyIds(COOKED_FOOD_ITEM_IDS)) {
				return []; // Exit Machine
			}

			throw new Error(
				'Unexpected state: No raw food in inventory to cook.',
			);
		}

		if (client.getWidget(17694735)) {
			bot.widgets.interactSpecifiedWidget(17694735, 1, 57, -1);
			return 3;
		}

		const cookablesInInventory = filterInventoryIds(RAW_FOOD_ITEM_IDS);

		bot.inventory.itemOnObjectWithIds(
			cookablesInInventory[0],
			ctx.cookingSourceTileObject,
		);

		return getRandomInt(1, 3);
	})
	.build();
