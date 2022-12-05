import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";
import { isNullish } from "$lib/utils/utils";
import type { Navigation } from "@sveltejs/kit";

export const pathForRouteId = (routeId: string | null | undefined): AppPath => {
  if (isNullish(routeId)) {
    return AppPath.Authentication;
  }

  const index = Object.values(AppPath).indexOf(
    routeId
      .replace(ROUTE_ID_GROUP_APP, "")
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
