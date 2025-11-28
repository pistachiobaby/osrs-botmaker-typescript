import { StateDefinition } from '../../../state-machine.js';
import WalkToLocation from './walk-to-location.js';

const ThievingState = {
	WalkToLocation: 'Thieving.WalkToLocation',
	ScanNPCs: 'Thieving.ScanNPCs',
	Stunned: 'Thieving.Stunned',
	Interact: 'Theiving.Interact',
	EatFood: 'Thieving.EatFood',
} as const;

export type ThievingState = (typeof ThievingState)[keyof typeof ThievingState];

const Definitions: StateDefinition<ThievingState> = {
	'Thieving.WalkToLocation': WalkToLocation,
	'Thieving.ScanNPCs': {
		transitions: [],
		onEnter: undefined,
		onExit: undefined,
		onTick: function (): void | number {},
	},
	'Thieving.Stunned': {
		transitions: [],
		onEnter: undefined,
		onExit: undefined,
		onTick: function (): void | number {},
	},
	'Theiving.Interact': {
		transitions: [],
		onEnter: undefined,
		onExit: undefined,
		onTick: function (): void | number {},
	},
	'Thieving.EatFood': {
		transitions: [],
		onEnter: undefined,
		onExit: undefined,
		onTick: function (): void | number {},
	},
};

export default Definitions;
