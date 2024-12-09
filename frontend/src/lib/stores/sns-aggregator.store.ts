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

// This project has been abandoneda and its metadata is currently broken
const CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID = "ibahq-taaaa-aaaaq-aadna-cai";

export const snsAggregatorStore: SnsAggregatorStore = derived(
  snsAggregatorIncludingAbortedProjectsStore,
  (store) => {
    const data = store.data?.filter(
      (sns) =>
        nonNullish(sns.lifecycle) &&
        sns.lifecycle.lifecycle !== SnsSwapLifecycle.Aborted
    );

    if (isNullish(data)) return { data: undefined };

    const cts = data.find(
      (sns) =>
        sns.list_sns_canisters.root === CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID
    );
    if (isNullish(cts)) return { data };
    const dataWithoutCts = data.filter(
      (sns) =>
        sns.list_sns_canisters.root !== CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID
    );

    return {
      data: [...dataWithoutCts, overrideCyclesTransferStation(cts)],
    };
  }
);

const overrideCyclesTransferStation = (
  sns: CachedSnsDto
): CachedSnsDto & { isAbandoned?: boolean } => {
  const hiddenCharacterToPushSnsToEndOfList = "\u200B";
  const originalName = "CYCLES-TRANSFER-STATION";
  const originalSymbol = "CTS";
  let name = sns.meta.name;

  if (name !== originalName) {
    name = `${hiddenCharacterToPushSnsToEndOfList}${name} (formerly ${originalName})`;
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
      if (symbol !== originalSymbol) {
        return [
          name,
          {
            Text: `${symbol} (${originalSymbol})`,
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
