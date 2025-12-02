import { getItemsWithNames, isPlayerBusy } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFightingState,
	DYING_ANIMATION,
	FIGHTING_LOOTABLES,
	FightingState,
} from '../fighting-states.js';

export default createFightingState(FightingState.Attack)
	.transitions(FightingState.Loot, FightingState.ScanNPCs)
	.onEnter((ctx) => {
		setOverlayStatusText(`Attacking ${ctx.targetNPC?.getName()}`);
	})
	.onCheckTransition(() => {
		// Switch to looting immediately if it's nearby
		if (getItemsWithNames(FIGHTING_LOOTABLES, 4).length > 0) {
			return [FightingState.Loot];
		}
	})
	.onTick((ctx) => {
		if (
			!ctx.targetNPC ||
			ctx.targetNPC.getAnimation() === DYING_ANIMATION
		) {
			return getItemsWithNames(FIGHTING_LOOTABLES, 12).length > 0
				? [FightingState.Loot]
				: [FightingState.ScanNPCs];
		}

		if (isPlayerBusy()) {
			return;
		}

		// try {
		// 	if (shouldEatFood()) {
		// 		return;
		// 	}
		// } catch {
		// 	return [];
		// }

		bot.npcs.interactSupplied(ctx.targetNPC, 'Attack');
	})
	.build();
