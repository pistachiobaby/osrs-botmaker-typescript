import { getRandomInt, isPlayerBusy } from '../../../../utils.js';
import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.Train)
	.onEnter(() => {
		setOverlayStatusText('Training magic...');
	})
	.transitions(MagicState.ScanNpcs)
	.onTick((ctx) => {
		if (!ctx.targetNPC) {
			return [MagicState.ScanNpcs];
		}

		if (isPlayerBusy()) {
			return;
		}

		const task = bot.task.create();

		task.act(() => {
			setOverlayStatusText('Selecting Spell...');
			bot.menuAction(
				-1,
				14287043, // Monster inspect
				net.runelite.api.MenuAction.WIDGET_TARGET,
				0,
				-1,
				'Cast',
				'',
			);
		});

		task.sleep(getRandomInt(500, 650));

		task.act(() => {
			setOverlayStatusText('Casting...');
			bot.menuAction(
				0,
				0,
				net.runelite.api.MenuAction.WIDGET_TARGET_ON_NPC,
				3306, // npc index
				-1,
				'Cast',
				'',
			);
		});

		task.sleep(getRandomInt(600, 800));

		task.act(() => {
			setOverlayStatusText('Closing Menu...');
			bot.widgets.interactSpecifiedWidget(34209809, 1, 57, -1);
		});

		task.sleep(getRandomInt(150, 250));

		task.stop();

		return;
	})
	.build();
