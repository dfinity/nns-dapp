import { browser } from "$app/environment";
import {
  FEATURE_FLAG_ENVIRONMENT,
  type FeatureFlags,
  type FeatureKey,
} from "$lib/constants/environment.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { derived, get, type Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

type OverrideFeatureFlagsData = Partial<FeatureFlags<boolean>>;
export interface OverrideFeatureFlagsStore
  extends Readable<OverrideFeatureFlagsData> {
  setFlag(flag: FeatureKey, value: boolean): void;
  removeFlag(flag: FeatureKey): void;
  reset: () => void;
}

const assertValidFeatureFlag = (flag: FeatureKey) => {
  if (!(flag in FEATURE_FLAG_ENVIRONMENT)) {
    throw new Error(`Unknown feature flag: ${flag}`);
  }
};

const assertEditableFeatureFlag = (flag: FeatureKey) => {
  assertValidFeatureFlag(flag);
  if (!EDITABLE_FEATURE_FLAGS.includes(flag)) {
    throw new Error(`Feature flag is not editable: ${flag}`);
  }
};

export const EDITABLE_FEATURE_FLAGS: Array<FeatureKey> = [
  "TEST_FLAG_EDITABLE",
  "ENABLE_CKTESTBTC",
  "ENABLE_PROJECTS_TABLE",
  "ENABLE_IMPORT_TOKEN",
  "DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING",
];

/**
 * A store that contains the feature flags that have been overridden by the user.
 */
const initOverrideFeatureFlagsStore = (): OverrideFeatureFlagsStore => {
  const { subscribe, set, update } = writableStored<OverrideFeatureFlagsData>({
    key: StoreLocalStorageKey.FeatureFlags,
    defaultValue: {},
  });

  return {
    subscribe,

    setFlag(flag: FeatureKey, value: boolean) {
      assertValidFeatureFlag(flag);
      update((featureFlags) => ({
        ...featureFlags,
        [flag]: value,
      }));
    },

    removeFlag(flag: FeatureKey) {
      assertValidFeatureFlag(flag);
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

interface FeatureFlagConsoleInterface {
  overrideWith(value: boolean): void;
  removeOverride(): void;
}

interface FeatureFlagsConsoleInterface
  extends FeatureFlags<FeatureFlagConsoleInterface> {
  list(): void;
}

const initSingleFeatureConsoleInterface = (
  key: FeatureKey
): FeatureFlagConsoleInterface => ({
  overrideWith: (value: boolean) => {
    assertEditableFeatureFlag(key);
    overrideFeatureFlagsStore.setFlag(key, value);
  },
  removeOverride: () => {
    assertEditableFeatureFlag(key);
    overrideFeatureFlagsStore.removeFlag(key);
  },
});

const listFeatureFlagsToConsole = () => {
  const overrideStates = get(overrideFeatureFlagsStore);
  let key: FeatureKey;
  for (key in FEATURE_FLAG_ENVIRONMENT) {
    const override = overrideStates[key];
    const defaultValue = FEATURE_FLAG_ENVIRONMENT[key];
    const value = override ?? defaultValue;
    console.log(
      `${key} ${value} (override ${override} default ${defaultValue})`
    );
  }
};

// Exported for testing.
export const initConsoleInterface = (): FeatureFlagsConsoleInterface => {
  const consoleInterface: Partial<FeatureFlagsConsoleInterface> = {};
  let key: FeatureKey;
  for (key in FEATURE_FLAG_ENVIRONMENT) {
    consoleInterface[key] = initSingleFeatureConsoleInterface(key);
  }
  return {
    ...consoleInterface,
    list: listFeatureFlagsToConsole,
  } as FeatureFlagsConsoleInterface;
};

if (browser) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (
    window as unknown as { __featureFlags: FeatureFlagsConsoleInterface }
  ).__featureFlags = initConsoleInterface();
}

const initFeatureFlagStore = (key: FeatureKey): Readable<boolean> =>
  derived(
    overrideFeatureFlagsStore,
    ($overrideFeatureFlagsStore) =>
      $overrideFeatureFlagsStore[key] ?? FEATURE_FLAG_ENVIRONMENT[key]
  );

const initFeatureFlagsStore = (): FeatureFlags<Readable<boolean>> => {
  const featureFlagStores: Partial<FeatureFlags<Readable<boolean>>> = {};
  let key: FeatureKey;
  for (key in FEATURE_FLAG_ENVIRONMENT) {
    featureFlagStores[key] = initFeatureFlagStore(key);
  }
  return featureFlagStores as FeatureFlags<Readable<boolean>>;
};

const featureFlagsStore = initFeatureFlagsStore();

export const {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
  ENABLE_PROJECTS_TABLE,
  ENABLE_IMPORT_TOKEN,
  DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING,
  // Used only in tests only
  TEST_FLAG_EDITABLE,
  TEST_FLAG_NOT_EDITABLE,
} = featureFlagsStore;
