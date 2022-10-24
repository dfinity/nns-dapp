import { AppPath } from "$lib/constants/routes.constants";

// TODO(GIX-1071): test + constant for (app)
export const pathForRouteId = (routeId: string): AppPath => {
  const index = Object.values(AppPath).indexOf(
    routeId.replace("(app)", "") as unknown as AppPath
  );
  const key = Object.keys(AppPath)[index];

  // TODO: solve eslint type checking
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-line
  return AppPath[key as keyof AppPath];
};
