import { AppPath, ROUTE_ID_GROUP_APP } from "$lib/constants/routes.constants";

export const pathForRouteId = (routeId: string | null | undefined): AppPath => {
  if (routeId === null || routeId === undefined) {
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
