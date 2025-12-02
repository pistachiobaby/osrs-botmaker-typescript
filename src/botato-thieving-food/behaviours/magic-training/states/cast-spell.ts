import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.CastSpell)
	.transitions(MagicState.CloseMenu, MagicState.ScanNpcs)
	.onEnter(() => {
		setOverlayStatusText('Casting spell...');
	})
	.onTick((ctx) => {
		if (!ctx.targetNPC) {
			return [MagicState.ScanNpcs];
		}

		bot.menuAction(
			0,
			0,
			net.runelite.api.MenuAction.WIDGET_TARGET_ON_NPC,
			3306, // npc index
			-1,
			'Cast',
			'',
		);

		return [MagicState.CloseMenu, 1];
	})
	.build();
