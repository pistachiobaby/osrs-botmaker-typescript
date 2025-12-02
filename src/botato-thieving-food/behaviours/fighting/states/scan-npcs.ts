import { getRandomInt } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFightingState,
	DYING_ANIMATION,
	FIGHTING_LOOTABLES,
	FightingState,
} from '../fighting-states.js';

export default createFightingState(FightingState.ScanNPCs)
	.transitions(FightingState.Attack, FightingState.Loot)
	.onEnter((ctx) => {
		setOverlayStatusText(`Scanning for ${ctx.targetNPCNames.join(',')}...`);
	})
	.onCheckTransition(() => {
		if (bot.inventory.isFull()) {
			bot.printLogMessage('Bot inventory is full exiting machine');
			return [];
		}

		const groundItems = bot.tileItems.getItemsWithNames(FIGHTING_LOOTABLES);
		if (
			groundItems.some(
				(groundItem) =>
					groundItem.item.getOwnership() ===
					net.runelite.api.TileItem.OWNERSHIP_SELF,
			)
		) {
			return [FightingState.Loot];
		}
	})
	.onTick((ctx) => {
		const npcs = bot.npcs
			.getWithNames(ctx.targetNPCNames)
			.filter((npc) => npc.getAnimation() !== DYING_ANIMATION);

		if (npcs.length === 0) {
			setOverlayStatusText('No valid NPC(s), waiting...');
			return getRandomInt(1, 4);
		}

		const closest = bot.npcs.getClosest(npcs);
		if (!closest) {
			bot.printLogMessage('Unexpected state, could not find closest NPC');
			return;
		}

		ctx.targetNPC = closest;
		return [FightingState.Attack];
	})
	.build();
