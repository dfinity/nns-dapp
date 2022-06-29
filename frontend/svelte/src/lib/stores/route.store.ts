import { writable } from "svelte/store";
import type { AppPath } from "../constants/routes.constants";
import { isAppPath } from "../utils/app-path.utils";
import { pushHistory, replaceHistory, routePath } from "../utils/route.utils";

export interface RouteStore {
  path: AppPath | string;
  lastPath: AppPath | string | undefined;
  referrerPath?: AppPath | string;
  isKnownPath: boolean;
}

/**
 * A store to handle the current route ("which page to display").
 * - update: update the state value
 * - navigate: update the state value and push the new route to the browser history i.e. update browser url with an entry in the navigation stack
 * - replace: update the state value and replace the route in the browser history i.e. update browser url without modifying the navigation stack
 *
 * The store contains following information:
 * - path: the application path - i.e. the page (see AppPath) that is displayed
 * - referrerPath: the page - i.e. the path - that linked to the current path. For example, if navigating from "Accounts" to "Voting" page, the referrerPath is `/#/accounts`. If the referrer is not the app, then is value is undefined.
 * - isKnownPath: tells if the path is a path that is supported by the app
 *  - currently is used to imitate the flutter dapp navigation (redirects the user to the first page "/accounts/")
 *  - later could be used to display a 404
 *
 */
const initRouteStore = () => {
  const { subscribe, update } = writable<RouteStore>({
    path: routePath(),
    lastPath: undefined,
    isKnownPath: isAppPath(routePath()),
  });

  return {
    subscribe,

    update: ({ path }: { path: string }) =>
      update((state: RouteStore) => ({
        ...state,
        path,
        lastPath: state.path,
        referrerPath: state.path,
        isKnownPath: isAppPath(path),
      })),

    navigate: ({ path, query }: { path: string; query?: string }) => {
      update((state: RouteStore) => ({
        ...state,
        path,
        lastPath: state.path,
        referrerPath: state.path,
        isKnownPath: isAppPath(path),
      }));

      pushHistory({ path, query });
    },

    replace: ({ path, query }: { path: string; query?: string }) => {
      update((state: RouteStore) => ({
        ...state,
        path,
        lastPath: state.path,
        referrerPath: state.path,
        isKnownPath: isAppPath(path),
      }));

      replaceHistory({ path, query });
    },
  };
};

export const routeStore = initRouteStore();
