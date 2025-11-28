import { CookingState, createCookingState } from '../cooking-states.js';

export default createCookingState(CookingState.FindCookingSource)
	.transitions(CookingState.WalkToCookingSource)
	.onTick((ctx) => {})
	.build();
