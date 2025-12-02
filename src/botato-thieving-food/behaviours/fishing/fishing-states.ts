import { makeStateBuilder } from '../../../state-machine.js';
import { WorldPoint } from '../../../imports.js';

export const FishingState = {
	WalkToLocation: 'Fishing.WalkToLocation',
	ScanSpots: 'Fishing.ScanSpots',
	Fish: 'Fishing.Fish',
} as const;

type FishingStates = (typeof FishingState)[keyof typeof FishingState];

interface FishingContext {
	fishingPoint: net.runelite.api.coords.WorldPoint | null;
	targetFishingSpot: net.runelite.api.NPC | null;
}

export const FishingPoints = [new WorldPoint(0, 0, 0)];

export const createFishingState = makeStateBuilder<
	FishingStates,
	FishingContext
>();
