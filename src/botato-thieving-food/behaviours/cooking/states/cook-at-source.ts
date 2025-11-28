import { CookingState, createCookingState } from '../cooking-states.js';

export default createCookingState(CookingState.CookAtSource)
	.onTick(() => {
		return;
	})
	.build();
