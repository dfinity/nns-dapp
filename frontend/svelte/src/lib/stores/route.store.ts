import { writable } from "svelte/store";
import type { AppPath } from "../constants/routes.constants";
import { isAppPath } from "../utils/app-path.utils";
import { pushHistory, replaceHistory, routePath } from "../utils/route.utils";

export interface RouteStore {
  path: AppPath | string;
  previousPath?: AppPath | string;
  isKnownPath: boolean;
}

/**
 * A store to handle the current route ("which page to display").
 * - update: update the state value
 * - navigate: update the state value and push the new route to the browser history i.e. update browser url with an entry in the navigation stack
 * - replace: update the state value and replace the route in the browser history i.e. update browser url without modifying the navigation stack
 */
const initRouteStore = () => {
  const { subscribe, update } = writable<RouteStore>({
    path: routePath(),
    isKnownPath: isAppPath(routePath()),
  });

  return {
    subscribe,

    update: ({ path }: { path: string }) =>
      update((state: RouteStore) => ({
        ...state,
        path,
        previousPath: state.path,
        isKnownPath: isAppPath(path),
      })),

    navigate: ({ path, query }: { path: string; query?: string }) => {
      update((state: RouteStore) => ({
        ...state,
        path,
        previousPath: state.path,
        isKnownPath: isAppPath(path),
      }));

      pushHistory({ path, query });
    },

    replace: ({ path, query }: { path: string; query?: string }) => {
      update((state: RouteStore) => ({
        ...state,
        path,
        previousPath: state.path,
        isKnownPath: isAppPath(path),
      }));

      replaceHistory({ path, query });
    },
  };
};

export const routeStore = initRouteStore();
