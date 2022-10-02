export const mockWaiting = (seconds: number, value?: unknown) =>
  new Promise((resolve) => setTimeout(() => resolve(value), seconds * 1000));

export const silentConsoleErrors = () =>
  jest.spyOn(console, "error").mockImplementation(jest.fn);
