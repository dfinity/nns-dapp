import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureKey,
} from "$lib/constants/environment.constants";
import * as featureFlagsModule from "$lib/stores/feature-flags.store";
import {
  featureFlagsStore,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  const noKey = "NO_KEY" as FeatureKey;
  const error = new Error(`Unknown feature flag: ${noKey}`);
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should set default value to env var FEATURE_FLAG_ENVIRONMENT", () => {
    let feature: FeatureKey;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      expect(get(featureFlagsStore[feature])).toEqual(
        FEATURE_FLAG_ENVIRONMENT[feature]
      );
    }
  });

  it("should export all feature flags on the module as boolean stores", () => {
    let feature: FeatureKey;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      expect(get(featureFlagsModule[feature])).toEqual(
        FEATURE_FLAG_ENVIRONMENT[feature]
      );
    }
  });

  it("should change value when overrideFeatureFlagsStore is updated", () => {
    const featureFlag = "ENABLE_SNS_2";

    overrideFeatureFlagsStore.setFlag(featureFlag, true);
    const enabledBefore = get(featureFlagsStore[featureFlag]);
    expect(enabledBefore).toEqual(true);

    overrideFeatureFlagsStore.setFlag(featureFlag, false);

    const enabledAfter = get(featureFlagsStore[featureFlag]);
    expect(enabledAfter).toEqual(false);
  });

  it("should throw if a non feature flag is set", () => {
    expect(() => overrideFeatureFlagsStore.setFlag(noKey, false)).toThrowError(
      error
    );
  });

  it("should remove feature flags", () => {
    const featureFlag = "ENABLE_SNS_2";
    const featureStore = featureFlagsStore[featureFlag];
    const initialValue = get(featureStore);

    overrideFeatureFlagsStore.setFlag(featureFlag, !initialValue);

    const enabledMid = get(featureStore);
    expect(enabledMid).toEqual(!initialValue);

    overrideFeatureFlagsStore.removeFlag(featureFlag);
    const enabledAfter = get(featureStore);
    expect(enabledAfter).toEqual(initialValue);
  });

  it("should throw if a non feature flag is removed", () => {
    expect(() => overrideFeatureFlagsStore.removeFlag(noKey)).toThrow(error);
  });
});
