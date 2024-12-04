import type {
  CachedSnsDto,
  CachedSnsTokenMetadataDto,
} from "$lib/types/sns-aggregator";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
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
  (store) => ({
    data: store.data
      ?.filter(
        (sns) =>
          nonNullish(sns.lifecycle) &&
          sns.lifecycle.lifecycle !== SnsSwapLifecycle.Aborted
      )
      .map(fixBrokenSnsMetadataBasedOnId),
  })
);

// TODO: Find a better way to fix broken SNS metadata.
const brokenSnsOverrides: Record<
  string,
  { name: string; tokenSymbol: string }
> = {
  "bd3sg-teaaa-aaaaa-qaaba-cai": {
    name: "CYCLES_TRANSFER_STATION",
    tokenSymbol: "CTS",
  },
};

const fixBrokenSnsMetadataBasedOnId = (sns: CachedSnsDto): CachedSnsDto => {
  const override = brokenSnsOverrides[sns.list_sns_canisters.root];
  if (!nonNullish(override)) return sns;
  const newMeta = {
    ...sns.meta,
    name: `${sns.meta.name} (formerly ${override.name})`,
  };

  const newIcrc1Metadata = sns.icrc1_metadata.map<
    [string, CachedSnsTokenMetadataDto[0][1]]
  >(([name, value]) => {
    if (name === "icrc1:symbol" && "Text" in value) {
      return [
        name,
        {
          Text: `${value.Text} (${override.tokenSymbol})`,
        },
      ];
    }
    return [name, value];
  });

  return {
    ...sns,
    meta: { ...newMeta },
    icrc1_metadata: [...newIcrc1Metadata],
  };
};
