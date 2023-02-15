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
  removeFlag(flag: keyof FeatureFlags): void;
  reset: () => void;
}

const assertFeatureFlag = (flag: keyof FeatureFlags) => {
  if (!(flag in FEATURE_FLAG_ENVIRONMENT)) {
    throw new Error(`Unknown feature flag: ${flag}`);
  }
};

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
      assertFeatureFlag(flag);
      update((featureFlags) => ({
        ...featureFlags,
        [flag]: value,
      }));
    },

    removeFlag(flag: keyof FeatureFlags) {
      assertFeatureFlag(flag);
      update((featureFlags) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [flag]: _, ...rest } = featureFlags;
        return rest;
      });
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
