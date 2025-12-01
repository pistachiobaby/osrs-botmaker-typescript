import { setOverlayStatusText } from '../../../overlay.js';
import {
	createThievingState,
	THIEVABLE_NPC_IDS,
	ThievingState,
} from '../thieving-states.js';

export default createThievingState(ThievingState.ScanNPCs)
	.transitions(ThievingState.WalkToLocation, ThievingState.Interact)
	.onEnter(() => {
		setOverlayStatusText('Scanning for NPCs...');
	})
	.onTick((ctx) => {
		const npcs = bot.npcs
			.getWithIds(THIEVABLE_NPC_IDS)
			.filter(
				(npc) =>
					!npc.isInteracting() &&
					npc.getInteracting() !== client.getLocalPlayer(),
			);

		if (npcs.length === 0) {
			throw new Error('No thievable NPCs found nearby.');
		}

		const closest = bot.npcs.getClosest(npcs);

		if (closest === null) {
			throw new Error("Couldn't find the closest NPC.");
		}

		ctx.targetNPC = closest;
		return [ThievingState.Interact];
	})
	.build();
