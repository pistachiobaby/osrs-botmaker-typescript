export function isPlayerBusy(): boolean {
	const player = client.getLocalPlayer();

	if (player.getAnimation() != -1 || player.isInteracting()) {
		return true;
	}

	return false;
}

function bindImporter<T>(...pkgs: any[]): T {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return new JavaImporter(...pkgs) as unknown as T;
}

interface J {
	WorldPoint: net.runelite.api.coords.WorldPoint;
}

export const imports = bindImporter<J>(net.runelite.api.coords);
