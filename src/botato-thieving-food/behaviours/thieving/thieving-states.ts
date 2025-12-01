import { makeStateBuilder } from '../../../state-machine.js';
import { WorldPoint } from '../../../imports.js';

export const ThievingState = {
	WalkToLocation: 'Thieving.WalkToLocation',
	ScanNPCs: 'Thieving.ScanNPCs',
	Stunned: 'Thieving.Stunned',
	Interact: 'Theiving.Interact',
} as const;

export type ThievingStates = (typeof ThievingState)[keyof typeof ThievingState];

export const GUARD_THIEVING_POINTS = [
	new WorldPoint(3006, 3323, 0), // Falador South Gate
];

export const THIEVABLE_NPC_IDS = [
	3254, // Falador Guard
];

export interface ThievingContext {
	targetNPC: net.runelite.api.NPC | null;
	thievingPoint: net.runelite.api.coords.WorldPoint | null;
	lastInteractionTick: number | null;
}

export const createThievingState = makeStateBuilder<
	ThievingStates,
	ThievingContext
>();
