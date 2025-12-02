import { getClosestPoint, handleWalkingToPoint } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFishingState,
	FishingPoints,
	FishingState,
} from '../fishing-states.js';

export default createFishingState(FishingState.WalkToLocation)
	.transitions(FishingState.ScanSpots)
	.onEnter((ctx) => {
		setOverlayStatusText('Walking to fishing location...');

		ctx.fishingPoint = getClosestPoint(
			client.getLocalPlayer().getWorldLocation(),
			FishingPoints,
		);
	})
	.onTick((ctx) => {
		if (!ctx.fishingPoint) {
			throw new Error('Could not find fishing point');
		}

		return handleWalkingToPoint(ctx.fishingPoint, 6, () => {
			return [FishingState.ScanSpots];
		});
	})
	.build();
