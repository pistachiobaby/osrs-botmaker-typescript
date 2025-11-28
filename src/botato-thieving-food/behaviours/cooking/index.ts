import { StateDefinition } from '../../../state-machine.js';

export const CookingState = {
	FindCookingSource: 'Cooking.FindCookingSource',
	WalkToCookingSource: 'Cooking.WalkToCookingSource',
	CookAtSource: 'Cooking.CookAtSource',
} as const;

export type CookingStates = (typeof CookingState)[keyof typeof CookingState];

let cookingSource: net.runelite.api.TileObject | null;

const Definitions: StateDefinition<CookingStates> = {
	[CookingState.FindCookingSource]: {
		transitions: [],
		onEnter: undefined,
		onExit: undefined,
		onTick: function (): void | number {},
	},
	[CookingState.WalkToCookingSource]: {
		transitions: [CookingState.CookAtSource],
		onTick: function (): void | number {},
	},
	[CookingState.CookAtSource]: {
		transitions: [],
		onTick: function (): void | number {},
	},
};

export default Definitions;
