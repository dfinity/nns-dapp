import { FEATURE_FLAGS } from "$lib/constants/environment.constants";
import { storeLocalStorageKey } from "$lib/constants/stores.constants";
import type { Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

export interface FeatureFlagsStore extends Readable<FEATURE_FLAGS> {
  reset: () => void;
}

/**
 * A store that contains the feature flags.
 */
export const initFeatureFlagsStore = (): FeatureFlagsStore => {
  const defaultFlags: FEATURE_FLAGS = FEATURE_FLAGS;

  const { subscribe, set } = writableStored<FEATURE_FLAGS>({
    key: storeLocalStorageKey.FeatureFlags,
    defaultValue: defaultFlags,
  });

  return {
    subscribe,
    // TODO: Expose a method to change one feature flag that raises error if feature flag does not exist
    reset: () => set(defaultFlags),
  };
};

export const featureFlagsStore = initFeatureFlagsStore();
