import { isPlayerBusy, shouldEatFood } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFightingState,
	DYING_ANIMATION,
	FightingState,
} from '../fighting-states.js';

export default createFightingState(FightingState.Attack)
	.transitions(FightingState.Loot, FightingState.ScanNPCs)
	.onEnter((ctx) => {
		setOverlayStatusText(`Attacking ${ctx.targetNPC?.getName()}`);
	})
	.onTick((ctx) => {
		if (
			!ctx.targetNPC ||
			ctx.targetNPC.getAnimation() === DYING_ANIMATION
		) {
			return [FightingState.ScanNPCs];
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
