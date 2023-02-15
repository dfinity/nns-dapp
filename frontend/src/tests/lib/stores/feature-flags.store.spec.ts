import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureKey,
} from "$lib/constants/environment.constants";
import * as featureFlagsModule from "$lib/stores/feature-flags.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  const noKey = "NO_KEY" as FeatureKey;
  const noKeyError = `Unknown feature flag: ${noKey}`;
  const notEditable = "TEST_FLAG_NOT_EDITABLE" as FeatureKey;
  const notEditableError = `Feature flag is not editable: ${notEditable}`;
  const editableFlag = "TEST_FLAG_EDITABLE" as FeatureKey;
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should export all feature flags on the module with default values", () => {
    let feature: FeatureKey;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      expect(get(featureFlagsModule[feature])).toEqual(
        FEATURE_FLAG_ENVIRONMENT[feature]
      );
    }
  });

  it("should change value when overrideFeatureFlagsStore is updated", () => {
    const featureFlag = featureFlagsModule[editableFlag];

    overrideFeatureFlagsStore.setFlag(editableFlag, true);
    const enabledBefore = get(featureFlag);
    expect(enabledBefore).toEqual(true);

    overrideFeatureFlagsStore.setFlag(editableFlag, false);

    const enabledAfter = get(featureFlag);
    expect(enabledAfter).toEqual(false);
  });

  it("should throw if a non feature flag is set", () => {
    expect(() => overrideFeatureFlagsStore.setFlag(noKey, false)).toThrowError(
      noKeyError
    );
  });

  it("should throw if a non editable feature flag is set", () => {
    expect(() =>
      overrideFeatureFlagsStore.setFlag(notEditable, false)
    ).toThrowError(notEditableError);
  });

  it("should remove feature flags", () => {
    const featureFlag = featureFlagsModule[editableFlag];
    const initialValue = get(featureFlag);

    overrideFeatureFlagsStore.setFlag(editableFlag, !initialValue);

    const enabledMid = get(featureFlag);
    expect(enabledMid).toEqual(!initialValue);

    overrideFeatureFlagsStore.removeFlag(editableFlag);
    const enabledAfter = get(featureFlag);
    expect(enabledAfter).toEqual(initialValue);
  });

  it("should throw if a non feature flag is removed", () => {
    expect(() => overrideFeatureFlagsStore.removeFlag(noKey)).toThrow(
      noKeyError
    );
  });

  it("should throw if a non editable feature flag is removed", () => {
    expect(() => overrideFeatureFlagsStore.removeFlag(notEditable)).toThrow(
      notEditableError
    );
  });
});
