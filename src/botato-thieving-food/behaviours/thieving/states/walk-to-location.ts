import { getClosestPoint, isPlayerBusy } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createThievingState,
	GUARD_THIEVING_POINTS,
	ThievingState,
} from '../thieving-states.js';

const minDistanceToThievingPoint = 6;
export default createThievingState(ThievingState.WalkToLocation)
	.transitions(ThievingState.ScanNPCs)
	.onEnter((ctx) => {
		setOverlayStatusText('Walking to thieving location...');

		const closestPoint = getClosestPoint(
			client.getLocalPlayer().getWorldLocation(),
			GUARD_THIEVING_POINTS,
		);

		ctx.thievingPoint = closestPoint;
	})
	.onTick((ctx) => {
		if (ctx.thievingPoint === null) {
			throw new Error('Thieving point is not set in context.');
		}

		if (isPlayerBusy()) {
			return;
		}

		const player = client.getLocalPlayer();
		const distanceToSource = player
			.getWorldLocation()
			.distanceTo(ctx.thievingPoint);

		if (distanceToSource <= minDistanceToThievingPoint) {
			bot.walking.webWalkCancel();
			return [ThievingState.ScanNPCs];
		} else {
			if (!bot.walking.isWebWalking()) {
				bot.walking.webWalkStart(ctx.thievingPoint);
			}
		}

		return;
	})
	.build();
