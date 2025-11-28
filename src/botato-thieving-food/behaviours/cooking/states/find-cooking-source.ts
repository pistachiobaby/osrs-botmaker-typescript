import { CookingState, createCookingState } from '../index.js';

export default createCookingState(CookingState.FindCookingSource)
	.transitions(CookingState.WalkToCookingSource)
	.onTick((ctx) => {})
	.build();
