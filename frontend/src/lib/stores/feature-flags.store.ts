import { browser } from "$app/environment";
import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureFlags,
} from "$lib/constants/environment.constants";
import { storeLocalStorageKey } from "$lib/constants/stores.constants";
import { derived, type Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

type OverrideFeatureFlagsData = Partial<FeatureFlags>;
export interface OverrideFeatureFlagsStore
  extends Readable<OverrideFeatureFlagsData> {
  setFlag(flag: keyof FeatureFlags, value: boolean): void;
  reset: () => void;
}

/**
 * A store that contains the feature flags that have been overridden by the user.
 */
const initOverrideFeatureFlagsStore = (): OverrideFeatureFlagsStore => {
  const { subscribe, set, update } = writableStored<OverrideFeatureFlagsData>({
    key: storeLocalStorageKey.FeatureFlags,
    defaultValue: {},
  });

  return {
    subscribe,

    setFlag(flag: keyof FeatureFlags, value: boolean) {
      update((featureFlags) => ({
        ...featureFlags,
        [flag]: value,
      }));
    },

    reset: () => set({}),
  };
};

// Exported for testing purposes
export const overrideFeatureFlagsStore = initOverrideFeatureFlagsStore();

if (browser) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (window as any).__featureFlagsStore = overrideFeatureFlagsStore;
}

export const featureFlagsStore = derived(
  overrideFeatureFlagsStore,
  ($overrideFeatureFlagsStore) => ({
    ...FEATURE_FLAG_ENVIRONMENT,
    ...$overrideFeatureFlagsStore,
  })
);
