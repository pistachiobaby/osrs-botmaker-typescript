import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.CloseMenu)
	.transitions(MagicState.BreakCheck)
	.onEnter(() => {
		setOverlayStatusText('Closing Menu...');
	})
	.onTick(() => {
		if (client.getWidget(34209793)) {
			bot.widgets.interactSpecifiedWidget(34209809, 1, 57, -1);
		}

		return [MagicState.BreakCheck, 2];
	})
	.build();
