import { getClosestPoint, isPlayerBusy } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createFightingState,
	FIGHTING_POINTS,
	FightingState,
} from '../fighting-states.js';

const minDistanceToFightingPoint = 8;
export default createFightingState(FightingState.WalkToLocation)
	.transitions(FightingState.ScanNPCs)
	.onEnter((ctx) => {
		setOverlayStatusText('Walking to fighting location...');

		const closestPoint = getClosestPoint(
			client.getLocalPlayer().getWorldLocation(),
			FIGHTING_POINTS,
		);

		ctx.fightingPoint = closestPoint;
	})
	.onTick((ctx) => {
		if (ctx.fightingPoint === null) {
			throw new Error('Fighting point is not set in context.');
		}

		if (isPlayerBusy()) {
			return;
		}

		const player = client.getLocalPlayer();
		const distanceToSource = player
			.getWorldLocation()
			.distanceTo(ctx.fightingPoint);

		if (distanceToSource <= minDistanceToFightingPoint) {
			bot.walking.webWalkCancel();
			return [FightingState.ScanNPCs];
		} else {
			if (!bot.walking.isWebWalking()) {
				bot.walking.webWalkStart(ctx.fightingPoint);
			}
		}

		return;
	})
	.build();
