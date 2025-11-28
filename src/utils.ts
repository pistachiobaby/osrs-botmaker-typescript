export function isPlayerBusy(): boolean {
	const player = client.getLocalPlayer();

	if (player.getAnimation() == -1 || player.isInteracting()) {
		return true;
	}

	return false;
}
