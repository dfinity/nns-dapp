import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
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

export const snsAggregatorStore: SnsAggregatorStore = derived(
  snsAggregatorIncludingAbortedProjectsStore,
  (store) => {
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
      data: [...dataWithoutAbandonedProjects],
    };
  }
);
