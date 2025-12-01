import {
	COOKED_FOOD_ITEM_IDS,
	isPlayerBusy,
	isPlayerStunned,
	shouldEatFood,
	shouldInteractWithPouches,
} from '../../../../utils.js';
import { setOverlayStatusText, setOverlayTickText } from '../../../overlay.js';
import { createThievingState, ThievingState } from '../thieving-states.js';

export default createThievingState(ThievingState.Interact)
	.transitions(ThievingState.Stunned, ThievingState.ScanNPCs)
	.onEnter(() => {
		setOverlayStatusText('Interacting with NPC...');
	})
	.onCheckTransition(() => {
		if (isPlayerStunned()) {
			return [ThievingState.Stunned];
		}
	})
	.onTick((ctx) => {
		if (ctx.targetNPC === null) {
			return [ThievingState.ScanNPCs];
		}

		if (isPlayerBusy()) {
			return;
		}

		if (!bot.inventory.containsAnyIds(COOKED_FOOD_ITEM_IDS)) {
			return []; // Exit machine if we have no cooked food
		}

		try {
			if (shouldEatFood()) {
				return;
			}
		} catch {
			return [];
		}

		if (shouldInteractWithPouches()) {
			return;
		}

		ctx.lastInteractionTick = client.getTickCount();
		setOverlayTickText(
			(ctx.lastInteractionTick - client.getTickCount()).toString(),
		);
		bot.npcs.interactSupplied(ctx.targetNPC, 'Pickpocket');
	})
	.build();
