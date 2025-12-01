import {
	isPlayerStunned,
	shouldEatFood,
	shouldInteractWithPouches,
} from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import { createThievingState, ThievingState } from '../thieving-states.js';

export default createThievingState(ThievingState.Stunned)
	.transitions(ThievingState.Interact, ThievingState.ScanNPCs)
	.onEnter(() => {
		setOverlayStatusText('Stunned, waiting to recover...');
	})
	.onCheckTransition(() => {
		if (!isPlayerStunned()) {
			return [ThievingState.Interact];
		}
	})
	.onTick(() => {
		try {
			if (shouldEatFood()) {
				return;
			}
		} catch {
			return [];
		}

		if (shouldInteractWithPouches()) {
			return;
		}
	})
	.build();
