import { AppPath, ROUTE_ID_GROUPS } from "$lib/constants/routes.constants";
import { isNullish } from "@dfinity/utils";
import type { AfterNavigate } from "@sveltejs/kit";

/**
 * Returns an AppPath for a given path.
 *
 * Ex: /(app)/accounts/ returns AppPath.Accounts
 * Ex: /(app)/proposal/ returns AppPath.Proposal
 *
 * @param routeId
 * @returns {AppPath}
 */
export const pathForRouteId = (routeId: string | null | undefined): AppPath => {
  const defaultPath = AppPath.Portfolio;

  if (isNullish(routeId)) {
    return defaultPath;
  }

  const routeIdWithoutGroups = (routeId: string): string =>
    ROUTE_ID_GROUPS.reduce(
      (acc: string, regex: string) => acc.replace(regex, ""),
      routeId
    );

  const pathWithoutGroups = routeIdWithoutGroups(routeId);
  const normalizedPath =
    pathWithoutGroups === "/"
      ? pathWithoutGroups
      : pathWithoutGroups.replace(/\/$/, "");
  const index = Object.values(AppPath).indexOf(
    normalizedPath as unknown as AppPath
  );

  const key = Object.keys(AppPath)[index];

  // TODO: solve eslint type checking
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-line
  return AppPath[key as keyof AppPath] ?? defaultPath;
};

export const referrerPathForNav = ({
  from,
}: AfterNavigate): AppPath | undefined =>
  from?.route.id !== null && from?.route.id !== undefined
    ? pathForRouteId(from.route.id)
    : undefined;
