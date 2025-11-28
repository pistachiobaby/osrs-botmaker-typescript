import { StateDefinition } from '../../../state-machine.js';
import WalkToLocation from './walk-to-location.js';

const ThievingState = {
	WalkToLocation: 'Thieving.WalkToLocation',
	ScanNPCs: 'Thieving.ScanNPCs',
	Stunned: 'Thieving.Stunned',
	Interact: 'Theiving.Interact',
	EatFood: 'Thieving.EatFood',
} as const;

export type ThievingStates = (typeof ThievingState)[keyof typeof ThievingState];
