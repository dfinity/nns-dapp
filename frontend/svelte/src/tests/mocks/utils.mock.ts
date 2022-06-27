export const mockWaiting = (seconds: number, value?: unknown) =>
  new Promise((resolve) => setTimeout(() => resolve(value), seconds * 1000));

export const mockAbout5SecondsWaiting = <T>(generator: () => T): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(generator()),
      Math.round((0.5 + Math.random() * 4.5) * 1000)
    )
  );

export const silentConsoleErrors = () =>
  jest.spyOn(console, "error").mockImplementation(jest.fn);
