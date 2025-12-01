import { getItemsWithNames } from '../../../../utils.js';
import {
	createFightingState,
	DYING_ANIMATION,
	FIGHTING_BURYABLES,
	FIGHTING_LOOTABLES,
	FightingState,
} from '../fighting-states.js';

export default createFightingState(FightingState.Loot)
	.transitions(FightingState.ScanNPCs, FightingState.Attack)
	.onTick((ctx) => {
		if (bot.inventory.containsAnyNames(FIGHTING_BURYABLES)) {
			bot.inventory.interactWithNames(FIGHTING_BURYABLES, ['Bury']);
		}

		if (
			!bot.inventory.isFull() &&
			bot.tileItems.lootItemsWithNames(FIGHTING_LOOTABLES, 12)
		) {
			return;
		}

		return !ctx.targetNPC ||
			ctx.targetNPC.getAnimation() === DYING_ANIMATION
			? [FightingState.ScanNPCs]
			: [FightingState.Attack];
	})
	.build();
