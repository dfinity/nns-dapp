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

export interface LoadedImportedSnsesStore extends Readable<CachedSnsDto[]> {
  set: (snses: CachedSnsDto[]) => void;
  reset: () => void;
}

/**
 * The imported SNSes that loaded and passed the checks, in the format of the SNS aggregator.
 */
const initLoadedImportedSnsesStore = (): LoadedImportedSnsesStore => {
  const { subscribe, set } = writable<CachedSnsDto[]>([]);

  return {
    subscribe,
    set,
    reset: () => set([]),
  };
};

export const loadedImportedSnsesStore = initLoadedImportedSnsesStore();
