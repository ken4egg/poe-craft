export const callArray = (fs: (() => void)[]) => (): void => fs.forEach((f) => f());
