import { setOverlayStatusText } from '../../../overlay.js';
import {
	createMagicTrainingState,
	MagicState,
	MagicTrainingTargetNames,
} from '../magic-training-states.js';

export default createMagicTrainingState(MagicState.ScanNpcs)
	.onEnter(() => {
		setOverlayStatusText('Scanning for training NPCs...');
	})
	.transitions(MagicState.SelectSpell)
	.onTick((ctx) => {
		const npcs = bot.npcs
			.getWithNames(MagicTrainingTargetNames)
			.filter(
				(npc) =>
					!npc.isInteracting() &&
					npc.getInteracting() !== client.getLocalPlayer(),
			);

		if (npcs.length === 0) {
			setOverlayStatusText('No valid NPCs nearby waiting...');
			return 2;
		}

		const closest = bot.npcs.getClosest(npcs);

		if (closest === null) {
			throw new Error("Weird State Couldn't find the closest NPC.");
		}

		ctx.targetNPC = closest;
		return [MagicState.SelectSpell];
	})
	.build();
