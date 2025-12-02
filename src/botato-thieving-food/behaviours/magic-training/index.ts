import { StateMachine } from '../../../state-machine.js';
import { MagicState } from './magic-training-states.js';
import breakCheck from './states/break-check.js';
import castSpell from './states/cast-spell.js';
import closeMenu from './states/close-menu.js';
import scanNpcs from './states/scan-npcs.js';
import selectSpell from './states/select-spell.js';
import train from './states/train.js';
import walkToLocation from './states/walk-to-location.js';

export default () =>
	StateMachine.create(
		{
			[MagicState.WalkToLocation]: walkToLocation,
			[MagicState.ScanNpcs]: scanNpcs,
			[MagicState.Train]: train,
			[MagicState.SelectSpell]: selectSpell,
			[MagicState.CastSpell]: castSpell,
			[MagicState.CloseMenu]: closeMenu,
			[MagicState.BreakCheck]: breakCheck,
		},
		MagicState.WalkToLocation,
	);
