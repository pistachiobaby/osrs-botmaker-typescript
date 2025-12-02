export const overlayManager =
	net.runelite.client.RuneLite.getInjector().getInstance(
		net.runelite.client.ui.overlay.OverlayManager,
	);

const TitleComponent = net.runelite.client.ui.overlay.components.TitleComponent;
const LineComponent = net.runelite.client.ui.overlay.components.LineComponent;

let overlayTickStateText: string = '';
let overlayCurrentStateText: string = '';
let overlayTimeoutText: string = '';
let overlayStatusText: string = '';
let overlayHealthThreshold: string = '';

export function setOverlayCurrentStateText(text: string) {
	overlayCurrentStateText = text;
}

export function setOverlayTickText(text: string) {
	overlayTickStateText = text;
}

export function setOverlayTimeoutText(text: string) {
	overlayTimeoutText = text;
}

export function setOverlayStatusText(text: string) {
	overlayStatusText = text;
}

export function setOverlayHealthThreshold(text: string) {
	overlayHealthThreshold = text;
}

export const overlay = new JavaAdapter(
	net.runelite.client.ui.overlay.OverlayPanel,
	{
		render: function (
			this: net.runelite.client.ui.overlay.OverlayPanel & {
				super$render(graphics: java.awt.Graphics2D): void;
			},
			graphics: java.awt.Graphics2D,
		) {
			this.panelComponent
				.getChildren()
				.add(
					TitleComponent.builder()
						.text('Botato Bunker Bot')
						.color(java.awt.Color.WHITE)
						.build(),
				);

			this.panelComponent
				.getChildren()
				.add(
					LineComponent.builder()
						.left('State:')
						.right(overlayCurrentStateText)
						.build(),
				);

			this.panelComponent
				.getChildren()
				.add(
					LineComponent.builder()
						.left('Tick:')
						.right(overlayTickStateText)
						.build(),
				);

			this.panelComponent
				.getChildren()
				.add(
					LineComponent.builder()
						.left('Timeout:')
						.right(overlayTimeoutText)
						.build(),
				);

			this.panelComponent
				.getChildren()
				.add(
					LineComponent.builder()
						.left('Health Threshold:')
						.right(overlayHealthThreshold)
						.build(),
				);

			this.panelComponent
				.getChildren()
				.add(
					LineComponent.builder()
						.left('Status:')
						.right(overlayStatusText)
						.build(),
				);

			return this.super$render(graphics);
		},
	},
) as unknown as net.runelite.client.ui.overlay.OverlayPanel;

overlay.setPosition(
	net.runelite.client.ui.overlay.OverlayPosition.ABOVE_CHATBOX_RIGHT,
);

overlay.setPreferredSize(new java.awt.Dimension(250, 0));
