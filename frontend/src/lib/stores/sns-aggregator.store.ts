import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
import { ENABLE_IMPORT_SNS } from "$lib/stores/feature-flags.store";
import {
  importedSnsesStore,
  loadedImportedSnsesStore,
} from "$lib/stores/imported-snses.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { isNullish, nonNullish } from "@dfinity/utils";
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";
import { derived, writable, type Readable } from "svelte/store";

/**
 * `undefined` means that the data is not loaded yet.
 */
export interface SnsAggregatorData {
  data: CachedSnsDto[] | undefined;
}

export interface SnsAggregatorStore extends Readable<SnsAggregatorData> {}

export interface SnsAggregatorIncludingAbortedProjectsStore
  extends SnsAggregatorStore {
  setData: (data: CachedSnsDto[]) => void;
  reset: () => void;
}

const initSnsAggreagatorStore =
  (): SnsAggregatorIncludingAbortedProjectsStore => {
    const { subscribe, set } = writable<SnsAggregatorData>({ data: undefined });

    return {
      subscribe,
      setData: (data) => set({ data }),
      reset: () => set({ data: undefined }),
    };
  };

export const snsAggregatorIncludingAbortedProjectsStore =
  initSnsAggreagatorStore();

/**
 * The imported SNSes that the app shows: the feature is on, the user did not
 * remove them, and the aggregator does not list them.
 */
const importedSnsEntriesStore: Readable<CachedSnsDto[]> = derived(
  [
    snsAggregatorIncludingAbortedProjectsStore,
    ENABLE_IMPORT_SNS,
    importedSnsesStore,
    loadedImportedSnsesStore,
  ],
  ([aggregatorStore, isEnabled, rootCanisterIds, { snses: loadedSnses }]) => {
    if (!isEnabled || isNullish(aggregatorStore.data)) {
      return [];
    }

    const listedRootCanisterIds = new Set(
      aggregatorStore.data.map(
        ({ canister_ids }) => canister_ids.root_canister_id
      )
    );

    return loadedSnses.filter(
      ({ canister_ids: { root_canister_id } }) =>
        rootCanisterIds.includes(root_canister_id) &&
        !listedRootCanisterIds.has(root_canister_id)
    );
  }
);

/**
 * True when the imported SNSes in the list have loaded, or when there is nothing to load.
 */
export const importedSnsesReadyStore: Readable<boolean> = derived(
  [ENABLE_IMPORT_SNS, importedSnsesStore, loadedImportedSnsesStore],
  ([isEnabled, rootCanisterIds, { rootCanisterIds: loadedRootCanisterIds }]) =>
    !isEnabled ||
    rootCanisterIds.every((id) => loadedRootCanisterIds?.includes(id))
);

export const importedSnsRootCanisterIdsStore: Readable<
  Set<RootCanisterIdText>
> = derived(
  importedSnsEntriesStore,
  (entries) =>
    new Set(entries.map(({ canister_ids }) => canister_ids.root_canister_id))
);

export const snsAggregatorStore: SnsAggregatorStore = derived(
  [snsAggregatorIncludingAbortedProjectsStore, importedSnsEntriesStore],
  ([store, importedSnses]) => {
    const data = store.data?.filter(
      (sns) =>
        nonNullish(sns.lifecycle) &&
        sns.lifecycle.lifecycle !== SnsSwapLifecycle.Aborted
    );

    if (isNullish(data)) return { data: undefined };

    const dataWithoutAbandonedProjects = data.filter(
      (sns) =>
        !abandonedProjectsCanisterId.includes(sns.list_sns_canisters.root)
    );

    return {
      data: [...dataWithoutAbandonedProjects, ...importedSnses],
    };
  }
);
