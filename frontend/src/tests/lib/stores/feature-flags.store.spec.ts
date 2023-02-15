import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureKey,
} from "$lib/constants/environment.constants";
import * as featureFlagsModule from "$lib/stores/feature-flags.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  const noKey = "NO_KEY" as FeatureKey;
  const error = new Error(`Unknown feature flag: ${noKey}`);
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should export all feature flags on the module with default values", () => {
    let feature: FeatureKey;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      expect(
        get(featureFlagsModule[feature]),
        `FeatureFlag ${feature} should be exported from feature-flags.store.ts`
      ).toEqual(FEATURE_FLAG_ENVIRONMENT[feature]);
    }
  });

  it("should change value when overrideFeatureFlagsStore is updated", () => {
    const featureKey = "ENABLE_SNS_2";
    const featureFlag = featureFlagsModule[featureKey];

    overrideFeatureFlagsStore.setFlag(featureKey, true);
    const enabledBefore = get(featureFlag);
    expect(enabledBefore).toEqual(true);

    overrideFeatureFlagsStore.setFlag(featureKey, false);

    const enabledAfter = get(featureFlag);
    expect(enabledAfter).toEqual(false);
  });

  it("should throw if a non feature flag is set", () => {
    expect(() => overrideFeatureFlagsStore.setFlag(noKey, false)).toThrowError(
      error
    );
  });

  it("should remove feature flags", () => {
    const featureKey = "ENABLE_SNS_2";
    const featureFlag = featureFlagsModule[featureKey];
    const initialValue = get(featureFlag);

    overrideFeatureFlagsStore.setFlag(featureKey, !initialValue);

    const enabledMid = get(featureFlag);
    expect(enabledMid).toEqual(!initialValue);

    overrideFeatureFlagsStore.removeFlag(featureKey);
    const enabledAfter = get(featureFlag);
    expect(enabledAfter).toEqual(initialValue);
  });

  it("should throw if a non feature flag is removed", () => {
    expect(() => overrideFeatureFlagsStore.removeFlag(noKey)).toThrow(error);
  });
});
