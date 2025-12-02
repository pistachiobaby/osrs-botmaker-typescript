import { setOverlayStatusText } from '../../../overlay.js';
import { createFishingState, FishingState } from '../fishing-states.js';

export default createFishingState(FishingState.ScanSpots)
	.transitions(FishingState.Fish)
	.onEnter((ctx) => {
		setOverlayStatusText('Scanning for Fishing spots...');
		ctx.targetFishingSpot = bot.npcs.getWithNames(['Fishing spot'])?.[0];
	})
	.onCheckTransition((ctx) => {
		if (ctx.targetFishingSpot) {
			return [FishingState.Fish];
		}

		throw new Error("Didn't find a suitable fishing spot");
	})
	.build();
