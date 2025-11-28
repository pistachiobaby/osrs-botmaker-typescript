/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export const overlayManager =
	net.runelite.client.RuneLite.getInjector().getInstance(
		net.runelite.client.ui.overlay.OverlayManager,
	);

const TitleComponent = net.runelite.client.ui.overlay.components.TitleComponent;
const LineComponent = net.runelite.client.ui.overlay.components.LineComponent;

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
						.left('Cool:')
						.right('Story bro')
						.build(),
				);

			return this.super$render(graphics);
		},
	},
) as unknown as net.runelite.client.ui.overlay.OverlayPanel;

overlay.setPosition(
	net.runelite.client.ui.overlay.OverlayPosition.ABOVE_CHATBOX_RIGHT,
);

overlay.setPreferredSize(new java.awt.Dimension(150, 0));
