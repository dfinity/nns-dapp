import type { AppPath } from "$lib/constants/routes.constants";
import { isArrayEmpty } from "./utils";

// If the previous page is a particular detail page and if we have data in store, we don't reset and query the data in store after the route is mounted.
// We do this to smoothness the back and forth navigation between the page and the detail page that have store that are not loaded at boot time.
export const reloadRouteData = <T>({
  expectedPreviousPath,
  effectivePreviousPath,
  currentData,
}: {
  expectedPreviousPath: AppPath;
  effectivePreviousPath: AppPath | undefined;
  currentData: T[] | undefined;
}): boolean => {
  const isRoutePath = (): boolean =>
    effectivePreviousPath !== undefined &&
    effectivePreviousPath === expectedPreviousPath;

  const isReferrerDetail = isRoutePath();

  return isArrayEmpty(currentData ?? []) || !isReferrerDetail;
};
