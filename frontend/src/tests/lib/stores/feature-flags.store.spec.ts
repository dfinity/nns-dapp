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

  describe("console interface", () => {
    let recordedLogs: Array<string> = [];

    beforeEach(() => {
      recordedLogs.length = 0;
      jest
        .spyOn(console, "log")
        .mockImplementation((...args) =>
          recordedLogs.push(args.map((s) => s ?? "undefined").join(" "))
        );
    });

    it("should list features", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();
      consoleInterface.list();

      expect(recordedLogs).toEqual(
        expect.arrayContaining([
          "TEST_FLAG_EDITABLE true (override undefined default true )",
        ])
      );
    });

    it("should expose override methods", () => {
      const consoleInterface = featureFlagsModule.initConsoleInterface();

      consoleInterface.TEST_FLAG_EDITABLE.overrideWith(false);

      const expectedOutput =
        "TEST_FLAG_EDITABLE false (override false default true )";
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
        "TEST_FLAG_EDITABLE true (override undefined default true )";
      expect(recordedLogs).not.toEqual(
        expect.arrayContaining([expectedOutput])
      );
      consoleInterface.list();
      expect(recordedLogs).toEqual(expect.arrayContaining([expectedOutput]));
    });
  });
});
