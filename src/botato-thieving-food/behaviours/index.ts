import { StateDefinition } from '../../state-machine.js';
import CookingDefinitions, { CookingStates } from './cooking/index.js';

type states = CookingStates;

export const BehaviourStateDefinions: StateDefinition<states> = {
	...CookingDefinitions,
};
