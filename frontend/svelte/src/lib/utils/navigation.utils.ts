import type { AppPath } from "../constants/routes.constants";
import { isRoutePath } from "./app-path.utils";
import { isArrayEmpty } from "./utils";

// If the previous page is a particular detail page and if we have data in store, we don't reset and query the data in store after the route is mounted.
// We do this to smoothness the back and forth navigation between the page and the detail page that have store that are not loaded at boot time.
export const reloadOnBack = <T>({
  expectedPreviousPath,
  effectivePreviousPath,
  currentData,
}: {
  expectedPreviousPath: AppPath;
  effectivePreviousPath: AppPath | string | undefined;
  currentData: T[] | undefined;
}): boolean => {
  const isReferrerDetail: boolean = isRoutePath({
    path: expectedPreviousPath,
    routePath: effectivePreviousPath,
  });

  return isArrayEmpty(currentData ?? []) || !isReferrerDetail;
};
