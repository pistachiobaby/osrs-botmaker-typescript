import { isPlayerBusy } from '../../../../utils.js';
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

		if (client.getWidget(10747962)?.isHidden()) {
			setOverlayStatusText('Magic Widget is NOT open...');
		} else {
			setOverlayStatusText('Magic Widget is open...');
		}

		// bot.menuAction(
		// 	-1,
		// 	14287043,
		// 	net.runelite.api.MenuAction.WIDGET_TARGET,
		// 	0,
		// 	-1,
		// 	'Cast',
		// 	'<col=00ff00>Monster Inspect</col>',
		// );

		// bot.menuAction(
		// 	0,
		// 	14286856,
		// 	net.runelite.api.MenuAction.WIDGET_TARGET,
		// 	0,
		// 	-1,
		// 	'Cast',
		// 	'',
		// );

		// bot.menuAction(
		// 	0,
		// 	0,
		// 	net.runelite.api.MenuAction.WIDGET_TARGET_ON_NPC,
		// 	3305,
		// 	-1,
		// 	'Cast',
		// 	'',
		// );

		// bot.magic.castOnNpc('WIND_STRIKE', ctx.targetNPC);

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

		task.sleep(600);

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

		task.sleep(1200);

		task.act(() => {
			setOverlayStatusText('Closing Menu...');
			bot.widgets.interactSpecifiedWidget(34209809, 1, 57, -1);
		});

		task.sleep(600);

		task.stop();

		return;
	})
	.build();
