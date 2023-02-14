import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureFlags,
} from "$lib/constants/environment.constants";
import {
  featureFlagsStore,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  const noKey = "NO_KEY" as keyof FeatureFlags;
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should set default value to env var FEATURE_FLAG_ENVIRONMENT", () => {
    const storeData = get(featureFlagsStore);

    expect(storeData).toEqual(FEATURE_FLAG_ENVIRONMENT);
  });

  it("should change value when overrideFeatureFlagsStore is updated", () => {
    const featureFlag = "ENABLE_SNS_2";

    overrideFeatureFlagsStore.setFlag(featureFlag, true);
    const storeDataBefore = get(featureFlagsStore);
    expect(storeDataBefore[featureFlag]).toEqual(true);

    overrideFeatureFlagsStore.setFlag(featureFlag, false);

    const storeDataAfter = get(featureFlagsStore);
    expect(storeDataAfter[featureFlag]).toEqual(false);
  });

  it("should throw if a non feature flag is set", () => {
    expect(() => overrideFeatureFlagsStore.setFlag(noKey, false)).toThrow();
  });

  it("should remove feature flags", () => {
    const featureFlag = "ENABLE_SNS_2";
    const storeDataBefore = get(featureFlagsStore);
    const initialValue = storeDataBefore[featureFlag];

    overrideFeatureFlagsStore.setFlag(featureFlag, !initialValue);

    const storeDataMid = get(featureFlagsStore);
    expect(storeDataMid[featureFlag]).toEqual(!initialValue);

    overrideFeatureFlagsStore.removeFlag(featureFlag);
    const storeDataAfter = get(featureFlagsStore);
    expect(storeDataAfter[featureFlag]).toEqual(initialValue);
  });

  it("should throw if a non feature flag is removed", () => {
    expect(() => overrideFeatureFlagsStore.removeFlag(noKey)).toThrow();
  });
});
