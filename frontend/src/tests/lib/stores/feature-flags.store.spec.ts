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
  const error = new Error(`Unknown feature flag: ${noKey}`);
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should set default value to env var FEATURE_FLAG_ENVIRONMENT", () => {
    let feature: keyof FeatureFlags<boolean>;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      expect(get(featureFlagsStore[feature])).toEqual(
        FEATURE_FLAG_ENVIRONMENT[feature]
      );
    }
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
    expect(() => overrideFeatureFlagsStore.setFlag(noKey, false)).toThrowError(
      error
    );
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
    expect(() => overrideFeatureFlagsStore.removeFlag(noKey)).toThrow(error);
  });
});
