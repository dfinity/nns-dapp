import { FEATURE_FLAGS } from "$lib/constants/environment.constants";
import { storeLocalStorageKey } from "$lib/constants/stores.constants";
import { derived, type Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

type OverrideFeatureFlagsData = Partial<FEATURE_FLAGS>;
export interface OverrideFeatureFlagsStore
  extends Readable<OverrideFeatureFlagsData> {
  reset: () => void;
}

/**
 * A store that contains the feature flags that have been overridden by the user.
 */
const initOverrideFeatureFlagsStore = (): OverrideFeatureFlagsStore => {
  const { subscribe, set } = writableStored<OverrideFeatureFlagsData>({
    key: storeLocalStorageKey.FeatureFlags,
    defaultValue: {},
  });

  return {
    subscribe,
    // TODO: Expose a method to change one feature flag that raises error if feature flag does not exist
    reset: () => set({}),
  };
};

const overrideFeatureFlagsStore = initOverrideFeatureFlagsStore();

export const featureFlagsStore = derived(
  overrideFeatureFlagsStore,
  ($overrideFeatureFlagsStore) => ({
    ...FEATURE_FLAGS,
    ...$overrideFeatureFlagsStore,
  })
);
