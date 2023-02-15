import { browser } from "$app/environment";
import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureFlags,
  type FeatureKey,
} from "$lib/constants/environment.constants";
import { storeLocalStorageKey } from "$lib/constants/stores.constants";
import { derived, type Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

type OverrideFeatureFlagsData = Partial<FeatureFlags<boolean>>;
export interface OverrideFeatureFlagsStore
  extends Readable<OverrideFeatureFlagsData> {
  setFlag(flag: FeatureKey, value: boolean): void;
  removeFlag(flag: FeatureKey): void;
  reset: () => void;
}

const assertFeatureFlag = (flag: FeatureKey) => {
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

    setFlag(flag: FeatureKey, value: boolean) {
      assertFeatureFlag(flag);
      update((featureFlags) => ({
        ...featureFlags,
        [flag]: value,
      }));
    },

    removeFlag(flag: FeatureKey) {
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

const initFeatureFlagStore = (key: FeatureKey): Readable<boolean> =>
  derived(
    overrideFeatureFlagsStore,
    ($overrideFeatureFlagsStore) =>
      $overrideFeatureFlagsStore[key] ?? FEATURE_FLAG_ENVIRONMENT[key]
  );

const initFeatureFlagsStore = (): FeatureFlags<Readable<boolean>> =>
  Object.keys(FEATURE_FLAG_ENVIRONMENT).reduce(
    (features, key) => ({
      ...features,
      [key]: initFeatureFlagStore(key as FeatureKey),
    }),
    {} as Partial<FeatureFlags<Readable<boolean>>>
  ) as FeatureFlags<Readable<boolean>>;

const featureFlagsStore = initFeatureFlagsStore();

export const {
  ENABLE_SNS_2,
  ENABLE_SNS_VOTING,
  ENABLE_SNS_AGGREGATOR,
  ENABLE_CKBTC_LEDGER,
  ENABLE_CKBTC_RECEIVE,
} = featureFlagsStore;
