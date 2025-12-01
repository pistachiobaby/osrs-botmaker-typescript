import { makeStateBuilder } from '../../../state-machine.js';
import { WorldPoint } from '../../../imports.js';

export const FightingState = {
	WalkToLocation: 'Fighting.WalkToLocation',
	ScanNPCs: 'Fighting.ScanNPCs',
	Attack: 'Fighting.Attack',
	Loot: 'Fighting.Loot',
} as const;

export type FightingStates = (typeof FightingState)[keyof typeof FightingState];

export const DYING_ANIMATION = 4935;
export const FIGHTING_POINTS = [
	new WorldPoint(2999, 3193, 0), // Rats
];

export interface FightingContext {
	targetNPCNames: string[];
	targetNPC: net.runelite.api.NPC;
	fightingPoint: net.runelite.api.coords.WorldPoint | null;
	lastInteractionTick: number | null;
}

export const createFightingState = makeStateBuilder<
	FightingStates,
	FightingContext
>();
