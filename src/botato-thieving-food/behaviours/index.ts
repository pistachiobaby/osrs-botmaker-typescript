import { StateDefinition } from '../../state-machine.js';
import CookingDefinitions, { CookingStates } from './cooking/index.js';
import ThievingDefinitions, { ThievingState } from './thieving/index.js';

type states = CookingStates | ThievingState;

export const BehaviourStateDefinions: StateDefinition<states> = {
	...CookingDefinitions,
	...ThievingDefinitions,
};
