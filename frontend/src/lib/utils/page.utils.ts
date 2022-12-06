import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
import { isNullish } from "$lib/utils/utils";
import type { Navigation } from "@sveltejs/kit";

/**
 * Returns an AppPath for a given path.
 *
 * Ex: /(app)/accounts/ returns AppPath.Accounts
 * Ex: /(app)/proposal/ returns AppPath.Proposal
 * Ex: (app)/accounts/ returns AppPath.Accounts
 *
 * @param routeId
 * @returns {AppPath}
 */
export const pathForRouteId = (routeId: string | null | undefined): AppPath => {
  if (isNullish(routeId)) {
    return AppPath.Authentication;
  }

  const index = Object.values(AppPath).indexOf(
    routeId
      .replace(ROUTE_ID_GROUP_APP, "")
      // Substitute two or more slashes together with one.
      // Sometimes the routeId is like this: /(app)/accounts others like this: (app)/accounts
      .replace(/\/{2,}/, "/")
      // Remove trailing slash if present
      .replace(/\/$/, "") as unknown as AppPath
  );
  const key = Object.keys(AppPath)[index];

  // TODO: solve eslint type checking
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-line
  return AppPath[key as keyof AppPath] ?? AppPath.Authentication;
};

export const referrerPathForNav = ({ from }: Navigation): AppPath | undefined =>
  from?.route.id !== null && from?.route.id !== undefined
    ? pathForRouteId(from.route.id)
    : undefined;
