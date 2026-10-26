import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { writable, type Readable } from "svelte/store";

export interface ImportedSnsesStore extends Readable<RootCanisterIdText[]> {
  add: (rootCanisterId: RootCanisterIdText) => void;
  remove: (rootCanisterId: RootCanisterIdText) => void;
  resetForTesting: () => void;
}

/**
 * The root canister IDs of the SNSes that the user imported in this browser.
 */
const initImportedSnsesStore = (): ImportedSnsesStore => {
  const { subscribe, update, resetForTesting } = writableStored<
    RootCanisterIdText[]
  >({
    key: StoreLocalStorageKey.ImportedSnses,
    defaultValue: [],
  });

  return {
    subscribe,
    add: (rootCanisterId) =>
      update((rootCanisterIds) =>
        rootCanisterIds.includes(rootCanisterId)
          ? rootCanisterIds
          : [...rootCanisterIds, rootCanisterId]
      ),
    remove: (rootCanisterId) =>
      update((rootCanisterIds) =>
        rootCanisterIds.filter((id) => id !== rootCanisterId)
      ),
    resetForTesting,
  };
};

export const importedSnsesStore = initImportedSnsesStore();

export interface LoadedImportedSnsesData {
  // The root canister IDs that the last load covered. `undefined` before the first load.
  rootCanisterIds: RootCanisterIdText[] | undefined;
  // The SNSes that loaded and passed the checks, in the format of the SNS aggregator.
  snses: CachedSnsDto[];
}

export interface LoadedImportedSnsesStore
  extends Readable<LoadedImportedSnsesData> {
  set: (data: LoadedImportedSnsesData) => void;
  reset: () => void;
}

const initLoadedImportedSnsesStore = (): LoadedImportedSnsesStore => {
  const initialData: LoadedImportedSnsesData = {
    rootCanisterIds: undefined,
    snses: [],
  };
  const { subscribe, set } = writable<LoadedImportedSnsesData>(initialData);

  return {
    subscribe,
    set,
    reset: () => set(initialData),
  };
};

export const loadedImportedSnsesStore = initLoadedImportedSnsesStore();
