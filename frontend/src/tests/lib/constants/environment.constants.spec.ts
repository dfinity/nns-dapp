import { defaultFeatureFlagValues } from "$lib/constants/environment.constants";
import * as envVarsUtils from "$lib/utils/env-vars.utils";

describe("FEATURE_FLAG_ENVIRONMENT", () => {
  const environmentVars = envVarsUtils.getEnvVars();

  beforeEach(() => {
    // The FEATURE_FLAG_ENVIRONMENT is a constant that is set once when the module
    // `environment.constants` is imported. To test different states of it,
    // we need to reset the imported modules and reimport `environment.constants` for each test.
    vi.resetModules();
  });

  it("should equal the environment values", async () => {
    const { FEATURE_FLAG_ENVIRONMENT } = await import(
      "$lib/constants/environment.constants"
    );
    const expectedFlags = JSON.parse(environmentVars.featureFlags);
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual(expectedFlags);
  });

  it("should contain missing entries substituted with default values", async () => {
    vi.spyOn(envVarsUtils, "getEnvVars").mockReturnValue({
      ...environmentVars,
      featureFlags: JSON.stringify({}),
    });

    const { FEATURE_FLAG_ENVIRONMENT } = await import(
      "$lib/constants/environment.constants"
    );
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual(defaultFeatureFlagValues);
  });

  it("should fallback to default on error", async () => {
    const spyConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.spyOn(envVarsUtils, "getEnvVars").mockReturnValue({
      ...environmentVars,
      featureFlags: `{"TEST_FLAG_NOT_EDITABLE": TRUE}`,
    });

    const { FEATURE_FLAG_ENVIRONMENT } = await import(
      "$lib/constants/environment.constants"
    );
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual(defaultFeatureFlagValues);
    expect(spyConsoleError).toBeCalledTimes(1);
    expect(spyConsoleError).toBeCalledWith(
      "Error parsing featureFlags",
      new SyntaxError("Unexpected token T in JSON at position 27")
    );
  });
});
