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
  const notEditable: FeatureKey = "TEST_FLAG_NOT_EDITABLE";
  const notEditableError = `Feature flag is not editable: ${notEditable}`;
  const editableFlag: FeatureKey = "TEST_FLAG_EDITABLE";
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  it("should export all feature flags on the module with default values", () => {
    let feature: FeatureKey;
    for (feature in FEATURE_FLAG_ENVIRONMENT) {
      // Include the feature in the expected value so when it fails it's clear
      // which feature is missing.
      expect([feature, get(featureFlagsModule[feature])]).toEqual([
        feature,
        FEATURE_FLAG_ENVIRONMENT[feature],
      ]);
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

  it("should not throw if a non editable feature flag is set", () => {
    // This is allowed for testing.
    // Below we test that the user can't set a non-editable feature flag.
    overrideFeatureFlagsStore.setFlag(notEditable, false);
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

  it("should not throw if a non editable feature flag is removed", () => {
    // This is allowed for testing.
    // Below we test that the user can't set a non-editable feature flag.
    overrideFeatureFlagsStore.removeFlag(notEditable);
  });

  describe("console interface", () => {
    const recordedLogs: Array<string> = [];

    beforeEach(() => {
      recordedLogs.length = 0;
      jest
        .spyOn(console, "log")
        .mockImplementation((s) => recordedLogs.push(s));
    });

    it("should list features", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();
      consoleInterface.list();

      expect(recordedLogs).toEqual(
        expect.arrayContaining([
          "TEST_FLAG_EDITABLE true (override undefined default true)",
        ])
      );
    });

    it("should expose override methods", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();

      consoleInterface.TEST_FLAG_EDITABLE.overrideWith(false);

      const expectedOutput =
        "TEST_FLAG_EDITABLE false (override false default true)";
      expect(recordedLogs).not.toEqual(
        expect.arrayContaining([expectedOutput])
      );
      consoleInterface.list();
      expect(recordedLogs).toEqual(expect.arrayContaining([expectedOutput]));
    });

    it("should expose remove override methods", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();

      consoleInterface.TEST_FLAG_EDITABLE.overrideWith(false);
      consoleInterface.TEST_FLAG_EDITABLE.removeOverride();

      const expectedOutput =
        "TEST_FLAG_EDITABLE true (override undefined default true)";
      expect(recordedLogs).not.toEqual(
        expect.arrayContaining([expectedOutput])
      );
      consoleInterface.list();
      expect(recordedLogs).toEqual(expect.arrayContaining([expectedOutput]));
    });

    it("should throw if a non-editable feature flag is set", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();
      const call = () =>
        consoleInterface.TEST_FLAG_NOT_EDITABLE.overrideWith(false);
      expect(call).toThrowError(notEditableError);
    });

    it("should throw if a non-editable feature flag is removed", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();
      const call = () =>
        consoleInterface.TEST_FLAG_NOT_EDITABLE.removeOverride();
      expect(call).toThrowError(notEditableError);
    });
  });
});
