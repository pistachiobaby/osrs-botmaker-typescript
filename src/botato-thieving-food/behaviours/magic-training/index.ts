import { StateMachine } from '../../../state-machine.js';
import { MagicState } from './magic-training-states.js';
import scanNpcs from './states/scan-npcs.js';
import train from './states/train.js';
import walkToLocation from './states/walk-to-location.js';

export default () =>
	StateMachine.create(
		{
			[MagicState.WalkToLocation]: walkToLocation,
			[MagicState.ScanNpcs]: scanNpcs,
			[MagicState.Train]: train,
		},
		MagicState.WalkToLocation,
	);
