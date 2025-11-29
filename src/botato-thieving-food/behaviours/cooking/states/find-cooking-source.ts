import { setOverlayStatusText } from '../../../overlay.js';
import { CookingState, createCookingState } from '../cooking-states.js';

const importer = new JavaImporter(net.runelite.api.coords.WorldPoint);

const { WorldPoint } = importer;

const point = new WorldPoint(2969, 3210, 0);

export default createCookingState(CookingState.FindCookingSource)
	.transitions(CookingState.WalkToCookingSource)
	.onEnter(() => {
		setOverlayStatusText('Scanning for Cooking Source...');
	})
	.onTick((ctx) => {
		const cookingSources = bot.objects.getTileObjectsWithNames([
			'Cooking Range',
			'Fire',
			'Stove',
		]);

		if (cookingSources.length === 0) {
			setOverlayStatusText('No Cooking Source found. Waiting...');
			return 10;
		} else {
			setOverlayStatusText(
				`Found ${cookingSources.length} Cooking Source(s). Walking to closest source...`,
			);

			ctx.cookingSourceTileObject =
				bot.objects.getClosest(cookingSources);

			return [CookingState.WalkToCookingSource];
		}
	})
	.build();
