import * as envVarsUtils from "$lib/utils/env-vars.utils";

describe("FEATURE_FLAG_ENVIRONMENT", () => {
  const environmentVars = envVarsUtils.getEnvVars();

  beforeEach(() => {
    vi.resetModules();
  });

  it("should equal the environment values", async () => {
    const { FEATURE_FLAG_ENVIRONMENT } = await import(
      "$lib/constants/environment.constants"
    );
    const expectedFlags = JSON.parse(environmentVars.featureFlags);
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual(expectedFlags);
  });

  it("should contain entries substituted with default values", async () => {
    vi.spyOn(envVarsUtils, "getEnvVars").mockReturnValue({
      ...environmentVars,
      featureFlags: JSON.stringify({}),
    });

    const { FEATURE_FLAG_ENVIRONMENT } = await import(
      "$lib/constants/environment.constants"
    );
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual({
      ENABLE_CKBTC: true,
      ENABLE_CKTESTBTC: false,
      DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: false,
      ENABLE_NEURON_VISIBILITY: false,
      ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: false,
      TEST_FLAG_EDITABLE: false,
      TEST_FLAG_NOT_EDITABLE: false,
    });
  });
});
