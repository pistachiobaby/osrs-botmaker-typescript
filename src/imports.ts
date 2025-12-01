function bindImporter<T>(...pkgs: any[]): T {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return new JavaImporter(...pkgs) as unknown as T;
}

const javaClasses = {
	WorldPoint: net.runelite.api.coords.WorldPoint,
} as const;

type JavaBindings = {
	[K in keyof typeof javaClasses]: (typeof javaClasses)[K];
};

const importer = bindImporter<JavaBindings>(...Object.values(javaClasses));

export const { WorldPoint } = importer;
