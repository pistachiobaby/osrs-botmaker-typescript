import { setOverlayStatusText } from '../../../overlay.js';
import { createFishingState, FishingState } from '../fishing-states.js';

export default createFishingState(FishingState.Fish)
	.transitions(FishingState.ScanSpots)
	.onEnter((ctx) => {
		setOverlayStatusText(`Fishing at ${ctx.targetFishingSpot?.getName()}`);
	})
	.onTick((ctx) => {
		if (!ctx.targetFishingSpot) {
			return [FishingState.ScanSpots];
		}

		bot.npcs.interactSupplied(ctx.targetFishingSpot, '');
	});
