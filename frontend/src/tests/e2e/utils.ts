import type { FeatureKey } from "$lib/constants/environment.constants";
import type { Page } from "@playwright/test";

export const setFeatureFlag = ({
  page,
  featureFlag,
  value,
}: {
  page: Page;
  featureFlag: FeatureKey;
  value: boolean;
}) =>
  page.evaluate(
    ({ featureFlag, value }) =>
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (window as any).__featureFlags[featureFlag]["overrideWith"](value),
    { featureFlag, value }
  );
