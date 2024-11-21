import { defaultFeatureFlagValues } from "$lib/constants/environment.constants";
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
    expect(FEATURE_FLAG_ENVIRONMENT).toEqual(defaultFeatureFlagValues);
  });
});
