import { makeStateBuilder } from '../../../state-machine.js';
import { WorldPoint } from '../../../imports.js';

export const MagicState = {
	WalkToLocation: 'MagicTraining.WalkToLocation',
	ScanNpcs: 'MagicTraining.ScanNPCs',
	Train: 'MagicTraining.Train',
	SelectSpell: 'MagicTraining.SelectSpell',
	CastSpell: 'MagicTraining.CastSpell',
	CloseMenu: 'MagicTraining.CloseMenu',
	BreakCheck: 'MagicTraining.BreakCheck',
} as const;

type MagicStates = (typeof MagicState)[keyof typeof MagicState];

interface MagicTrainingContext {
	targetNPC?: net.runelite.api.NPC;
	trainingPoint?: net.runelite.api.coords.WorldPoint;
}

export const MagicTrainingPoints = [
	new WorldPoint(2967, 3212, 1), // Hengel and dumbfuck upstairs remmington
];

export const MagicTrainingTargetNames = ['Hengel', 'Anja'];

export const createMagicTrainingState = makeStateBuilder<
	MagicStates,
	MagicTrainingContext
>();
