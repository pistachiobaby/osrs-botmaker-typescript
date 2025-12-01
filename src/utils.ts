export const RAW_FOOD_ITEM_IDS = [
	2134, // Raw meat
];
export const COOKED_FOOD_ITEM_IDS = [
	2142, // Cooked meat
];
export const BURNT_FOOD_ITEM_IDS = [
	2146, // Burnt meat
];

export function isPlayerBusy(): boolean {
	const player = client.getLocalPlayer();

	if (player.getAnimation() != -1 || player.isInteracting()) {
		return true;
	}

	return false;
}

export function isPlayerStunned(): boolean {
	const player = client.getLocalPlayer();
	return player.hasSpotAnim(245);
}

export function getClosestPoint(
	playerLocation: net.runelite.api.coords.WorldPoint,
	points: readonly net.runelite.api.coords.WorldPoint[],
): net.runelite.api.coords.WorldPoint | null {
	let closestSource: net.runelite.api.coords.WorldPoint | null = null;
	for (const point of points) {
		if (closestSource === null) {
			closestSource = point;
			continue;
		}

		if (
			playerLocation.distanceTo(point) <
			playerLocation.distanceTo(closestSource)
		) {
			closestSource = point;
		}
	}

	return closestSource;
}

export function filterInventoryIds(wantedIds: number[]): number[] {
	const container = client.getItemContainer(
		net.runelite.api.InventoryID.INVENTORY,
	);
	if (!container) return [];

	// Convert to a Set for O(1) lookups
	const wanted = new Set(wantedIds);

	const matches: number[] = [];

	const items: net.runelite.api.Item[] = container.getItems(); // Java array
	for (const item of items) {
		const id = item.getId();
		if (wanted.has(id)) {
			matches.push(id);
		}
	}

	return matches;
}

export function getRandomInt(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shouldEatFood(): boolean {
	const foodQuantity =
		bot.inventory.getQuantityOfAllIds(COOKED_FOOD_ITEM_IDS);

	if (foodQuantity <= 0) {
		throw new Error('No cooked food in inventory to eat.');
	}

	const playerHealth = client.getBoostedSkillLevel(
		net.runelite.api.Skill.HITPOINTS,
	);

	if (playerHealth < getRandomInt(5, 9)) {
		bot.inventory.interactWithIds(COOKED_FOOD_ITEM_IDS, ['Eat']);
		return true;
	}

	return false;
}

export function shouldInteractWithPouches(
	mininumToInteractWith: number = 28,
): boolean {
	if (
		bot.inventory.getQuantityOfAllNames(['Coin pouch']) <
		(mininumToInteractWith ?? 1)
	) {
		return false;
	}

	bot.inventory.interactWithNames(['Coin pouch'], ['Open-all']);
	return true;
}

export function getItemsWithNames(names: string[], maxDistance: number) {
	const player = client.getLocalPlayer();
	const playerLocation = player.getWorldLocation();

	const groundItems = bot.tileItems.getItemsWithNames(names);
	const itemsInDistance = groundItems.filter((groundItem) => {
		const owned =
			groundItem.item.getOwnership() ===
			net.runelite.api.TileItem.OWNERSHIP_SELF;
		const inDistance =
			playerLocation.distanceTo(groundItem.tile.getWorldLocation()) <=
			maxDistance;

		return owned && inDistance;
	});

	return itemsInDistance;
}
