import { StateMachine } from '../../../state-machine.js';
import cookAtSource from './states/cook-at-source.js';
import findCookingSource from './states/find-cooking-source.js';
import walkToCookingSource from './states/walk-to-cooking-source.js';
import { CookingState } from './cooking-states.js';

export {
	CookingState,
	type CookingStates,
	type CookingContext,
	createCookingState,
} from './cooking-states.js';

export default StateMachine.create(
	{
		[CookingState.FindCookingSource]: findCookingSource,
		[CookingState.WalkToCookingSource]: walkToCookingSource,
		[CookingState.CookAtSource]: cookAtSource,
	},
	CookingState.FindCookingSource,
);
