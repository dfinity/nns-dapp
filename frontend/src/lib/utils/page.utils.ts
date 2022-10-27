import { AppPath } from "$lib/constants/routes.constants";

// TODO(GIX-1071): test + constant for (app)
export const pathForRouteId = (routeId: string | null | undefined): AppPath => {
  if (routeId === null || routeId === undefined) {
    return AppPath.Authentication;
  }

  const index = Object.values(AppPath).indexOf(
    routeId.replace("(app)", "").replace(/\/$/, "") as unknown as AppPath
  );
  const key = Object.keys(AppPath)[index];

  // TODO: solve eslint type checking
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-line
  return AppPath[key as keyof AppPath];
};
