import { StateConfig } from '../../../state-machine.js';
import { ThievingState } from './index.js';

const config: StateConfig<ThievingState> = {
	transitions: ['Thieving.ScanNPCs'],
	onTick: function (): void | number {},
};

export default config;
