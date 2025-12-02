import {
	createMagicTrainingState,
	MagicState,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.BreakCheck)
	.transitions(MagicState.SelectSpell, MagicState.ScanNpcs)
	.onEnter(() => {
		bot.breakHandler.setBreakHandlerStatus(true);
	})
	.onCheckTransition((ctx) => {
		return ctx.targetNPC ? [MagicState.SelectSpell] : [MagicState.ScanNpcs];
	})
	.onExit(() => {
		bot.breakHandler.setBreakHandlerStatus(false);
	})
	.build();
