import { StateMachine } from '../../../state-machine.js';
import { FightingState } from './fighting-states.js';
import walkToLocation from './states/walk-to-location.js';
import scanNpcs from './states/scan-npcs.js';
import attack from './states/attack.js';
import loot from './states/loot.js';

export default (targetNPCNames: string[]) =>
	StateMachine.create(
		{
			[FightingState.WalkToLocation]: walkToLocation,
			[FightingState.ScanNPCs]: scanNpcs,
			[FightingState.Attack]: attack,
			[FightingState.Loot]: loot,
		},
		FightingState.WalkToLocation,
		{
			context: {
				targetNPCNames,
			},
		},
	);
