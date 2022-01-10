import { writable } from "svelte/store";
import { HistoryAction, routePath, updateHistory } from "../utils/route.utils";

export interface RouteStore {
  path: string;
}

export const initRouteStore = () => {
  const { subscribe, update } = writable<RouteStore>({
    path: routePath(),
  });

  return {
    subscribe,

    navigate: ({
      path,
      action,
      query,
    }: {
      path: string;
      action?: HistoryAction;
      query?: string;
    }) => {
      update((state: RouteStore) => ({ ...state, path }));

      if (!action) {
        return;
      }

      updateHistory({ path, action, query });
    },
  };
};

export const routeStore = initRouteStore();
