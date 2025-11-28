import { CookingState, createCookingState } from '../index.js';

export default createCookingState(CookingState.CookAtSource)
	.onTick(() => {
		return;
	})
	.build();
