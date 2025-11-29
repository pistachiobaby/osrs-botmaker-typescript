/// <reference types="@deafwave/osrs-botmaker-types" />

import {
	overlay,
	overlayManager,
	setOverlayCurrentStateText,
	setOverlayTimeoutText,
} from './overlay.js';
import cookingMachine from './behaviours/cooking/index.js';

/* eslint-disable @typescript-eslint/no-unused-vars */

export function onStart(): void {
	overlayManager.add(overlay);
}

export function onEnd(): void {
	//bot.printGameMessage('Executed JS onEnd Method');
	overlayManager.remove(overlay);
}

export function onGameTick(): void {
	//bot.printGameMessage('Executed JS onGameTick Method');
	setOverlayCurrentStateText(cookingMachine.state);
	setOverlayTimeoutText(cookingMachine.timeout?.toString() ?? 'N/A');

	cookingMachine.tick();
	// sm.tick();
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
