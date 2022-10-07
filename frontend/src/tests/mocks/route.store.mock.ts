import type { RouteStore } from "$lib/stores/route.store";
import type { Subscriber } from "svelte/store";

export const mockRouteStoreSubscribe =
  (path: string) =>
  (run: Subscriber<RouteStore>): (() => void) => {
    run({ path, isKnownPath: true });

    return () => undefined;
  };
