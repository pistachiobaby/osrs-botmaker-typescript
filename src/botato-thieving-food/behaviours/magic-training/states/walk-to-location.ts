import { getClosestPoint, handleWalkingToPoint } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
	MagicTrainingPoints,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.WalkToLocation)
	.transitions(MagicState.ScanNpcs)
	.onEnter((ctx) => {
		setOverlayStatusText('Walking to magic training area');

		const closestPoint = getClosestPoint(
			client.getLocalPlayer().getWorldLocation(),
			MagicTrainingPoints,
		);

		ctx.trainingPoint = closestPoint ?? undefined;
	})
	.onTick((ctx) => {
		if (!ctx.trainingPoint) {
			throw new Error('Could not find magic training point');
		}

		return handleWalkingToPoint(ctx.trainingPoint, 6, () => {
			return [MagicState.ScanNpcs];
		});
	})
	.build();
