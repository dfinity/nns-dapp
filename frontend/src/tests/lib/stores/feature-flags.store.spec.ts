import { FEATURE_FLAG_ENVIRONMENT } from "$lib/constants/environment.constants";
import { featureFlagsStore } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  it("should set default value to env var FEATURE_FLAG_ENVIRONMENT", () => {
    const storeData = get(featureFlagsStore);

    expect(storeData).toEqual(FEATURE_FLAG_ENVIRONMENT);
  });
});
