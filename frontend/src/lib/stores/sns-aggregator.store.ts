import {
  abandonedProjectsCanisterId,
  CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID,
  SEERS_ROOT_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import type {
  CachedSnsDto,
  CachedSnsTokenMetadataDto,
} from "$lib/types/sns-aggregator";
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

    const abandonedProjects = data.filter((sns) =>
      abandonedProjectsCanisterId.includes(sns.list_sns_canisters.root)
    );
    if (abandonedProjects.length === 0) return { data };
    const dataWithoutAbandonedProjects = data.filter(
      (sns) =>
        !abandonedProjectsCanisterId.includes(sns.list_sns_canisters.root)
    );

    return {
      data: [
        ...dataWithoutAbandonedProjects,
        ...abandonedProjects.map(overrideAbandonedProjects),
      ],
    };
  }
);

const overrideAbandonedProjects = (
  sns: CachedSnsDto
): CachedSnsDto & { isAbandoned?: boolean } => {
  const originalData: Record<string, { name: string; symbol: string }> = {
    [CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID]: {
      name: "CYCLES-TRANSFER-STATION",
      symbol: "CTS",
    },
    [SEERS_ROOT_CANISTER_ID]: {
      name: "SEERS",
      symbol: "SEER",
    },
  };
  const originalProjectData = originalData[sns.list_sns_canisters.root];
  const hiddenCharacterToPushSnsToEndOfList = "\u200B";
  let name = sns.meta.name;

  if (name !== originalProjectData.name) {
    name = `${hiddenCharacterToPushSnsToEndOfList}${name} (formerly ${originalProjectData.name})`;
  }

  const newMeta = {
    ...sns.meta,
    name,
  };

  const newIcrc1Metadata = sns.icrc1_metadata.map<
    [string, CachedSnsTokenMetadataDto[0][1]]
  >(([name, value]) => {
    if (name === "icrc1:symbol" && "Text" in value) {
      const symbol = value.Text;
      if (symbol !== originalProjectData.symbol) {
        return [
          name,
          {
            Text: `${symbol} (${originalProjectData.symbol})`,
          },
        ];
      }
    }
    return [name, value];
  });

  return {
    ...sns,
    meta: { ...newMeta },
    icrc1_metadata: [...newIcrc1Metadata],
    isAbandoned: true,
  };
};
