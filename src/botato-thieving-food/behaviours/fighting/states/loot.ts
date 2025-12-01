import { createFightingState, FightingState } from '../fighting-states.js';

export default createFightingState(FightingState.Loot)
	.transitions(
		FightingState.Loot,
		FightingState.ScanNPCs,
		FightingState.Attack,
	)
	.onTick(() => {})
	.build();
