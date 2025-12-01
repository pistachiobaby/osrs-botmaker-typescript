import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFightingState,
	DYING_ANIMATION,
	FightingState,
} from '../fighting-states.js';

export default createFightingState(FightingState.ScanNPCs)
	.transitions(FightingState.Attack)
	.onEnter((ctx) => {
		setOverlayStatusText(`Scanning for ${ctx.targetNPCNames.join(',')}...`);
	})
	.onTick((ctx) => {
		const npcs = bot.npcs
			.getWithNames(ctx.targetNPCNames)
			.filter((npc) => npc.getAnimation() !== DYING_ANIMATION);

		if (npcs.length === 0) {
			setOverlayStatusText('No valid NPC(s), waiting...');
			return 2;
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
