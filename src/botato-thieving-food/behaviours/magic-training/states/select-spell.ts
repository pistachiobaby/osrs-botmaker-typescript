import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.SelectSpell)
	.transitions(MagicState.CastSpell, MagicState.ScanNpcs)
	.onEnter(() => {
		setOverlayStatusText('Selecting spell...');
	})
	.onTick((ctx) => {
		if (!ctx.targetNPC) {
			return [MagicState.ScanNpcs];
		}

		bot.menuAction(
			-1,
			14287043, // Monster inspect
			net.runelite.api.MenuAction.WIDGET_TARGET,
			0,
			-1,
			'Cast',
			'',
		);

		return [MagicState.CastSpell];
	})
	.build();
