import { FEATURE_FLAGS } from "$lib/constants/environment.constants";
import { featureFlagsStore } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("featureFlags store", () => {
  it("should set default value to env var FEATURE_FLAGS", () => {
    const storeData = get(featureFlagsStore);

    expect(storeData).toEqual(FEATURE_FLAGS);
  });
});
