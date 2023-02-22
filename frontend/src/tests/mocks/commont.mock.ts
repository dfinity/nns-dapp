import type { Subscriber } from "svelte/store";

export const mockStoreSubscribe =
  <T>(arg: T) =>
  (run: Subscriber<T>): (() => void) => {
    run(arg);

    return () => undefined;
  };
