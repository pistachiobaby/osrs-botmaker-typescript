/// <reference types="@deafwave/osrs-botmaker-types" />

import {
	overlay,
	overlayManager,
	setOverlayCurrentStateText,
	setOverlayTimeoutText,
} from './overlay.js';

import thievingMachine from './behaviours/thieving/index.js';
import cookingMachine from './behaviours/cooking/index.js';
import fightingMachine from './behaviours/fighting/index.js';
import magicTrainingMachine from './behaviours/magic-training/index.js';

import { Orchestrator } from '../orchestrator.js';
import { StateMachine } from '../state-machine.js';
import { COOKED_FOOD_ITEM_IDS, RAW_FOOD_ITEM_IDS } from '../utils.js';
import magicTraining from './behaviours/magic-training/index.js';

/* eslint-disable @typescript-eslint/no-unused-vars */

let orchestrator: Orchestrator<StateMachine<any, any, any>>;

export function onStart(): void {
	overlayManager.add(overlay);
	orchestrator = new Orchestrator(() => {
		// const hasCookedFood =
		// 	bot.inventory.containsAnyIds(COOKED_FOOD_ITEM_IDS);
		// const hasRawFood = bot.inventory.containsAnyIds(RAW_FOOD_ITEM_IDS);

		// if (hasCookedFood) {
		// 	return thievingMachine();
		// } else if (hasRawFood) {
		// 	return cookingMachine();
		// }

		return magicTrainingMachine();
	});
}

export function onEnd(): void {
	if (bot.walking.isWebWalking()) {
		bot.walking.webWalkCancel();
	}

	overlayManager.remove(overlay);
}

export function onGameTick(): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	setOverlayCurrentStateText(orchestrator.active?.state ?? 'N/A');
	setOverlayTimeoutText(orchestrator.active?.timeout?.toString() ?? 'N/A');
	orchestrator.tick();
}

export function onNpcAnimationChanged(npc: net.runelite.api.Actor): void {
	//bot.printGameMessage('Executed JS onNpcAnimationChanged Method ' + npc.getId());
}

export function onActorDeath(actor: net.runelite.api.Actor): void {
	//bot.printGameMessage('Executed JS onActorDeath Method');
}

export function onHitsplatApplied(
	actor: net.runelite.api.Actor,
	hitsplat: net.runelite.api.Hitsplat,
): void {
	//bot.printGameMessage('Executed JS onHitsplatApplied Method');
}

export function onInteractingChanged(
	sourceActor: net.runelite.api.Actor,
	targetActor: net.runelite.api.Actor,
): void {
	//bot.printGameMessage('Executed JS onInteractingChanged Method');
}

export function onChatMessage(
	type: net.runelite.api.ChatMessageType,
	name: string,
	message: string,
): void {
	//bot.printGameMessage('Executed JS onChatMessage Method: ' + name);
}
