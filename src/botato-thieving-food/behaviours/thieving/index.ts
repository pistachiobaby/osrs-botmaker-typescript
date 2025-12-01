import { StateMachine } from '../../../state-machine.js';
import { ThievingState } from './thieving-states.js';
import walkToLocation from './states/walk-to-location.js';
import scanNPCs from './states/scan-npcs.js';
import interact from './states/interact.js';
import stunned from './states/stunned.js';

export default () =>
	StateMachine.create(
		{
			[ThievingState.WalkToLocation]: walkToLocation,
			[ThievingState.ScanNPCs]: scanNPCs,
			[ThievingState.Interact]: interact,
			[ThievingState.Stunned]: stunned,
		},
		ThievingState.WalkToLocation,
	);
