export const mockWaiting = (seconds: number, value?: unknown) =>
  new Promise((resolve) => setTimeout(() => resolve(value), seconds * 1000));
