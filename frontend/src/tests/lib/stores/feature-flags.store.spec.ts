import { FEATURE_FLAG_ENVIRONMENT } from "$lib/constants/environment.constants";
import {
  featureFlagsStore,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should set default value to env var FEATURE_FLAG_ENVIRONMENT", () => {
    const storeData = get(featureFlagsStore);

    expect(storeData).toEqual(FEATURE_FLAG_ENVIRONMENT);
  });

  it("should change value when overrideFeatureFlagsStore is updated", () => {
    const featureFlag = "ENABLE_SNS_2";
    const storeDataBefore = get(featureFlagsStore);
    expect(storeDataBefore[featureFlag]).toEqual(true);

    overrideFeatureFlagsStore.setFlag(featureFlag, false);

    const storeDataAfter = get(featureFlagsStore);
    expect(storeDataAfter[featureFlag]).toEqual(false);
  });
});
