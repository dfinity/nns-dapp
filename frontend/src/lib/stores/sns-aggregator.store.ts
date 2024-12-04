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

    // TODO: Find a better way to fix broken SNS metadata. These transformations will be remove once we have a better solution.
    const handledAbandonedSnsData =
      data?.map(fixBrokenSnsMetadataBasedOnId);
    const sortedAbandonesSnsData = sortedListBasedOnAbandoned(
      handledAbandonedSnsData
    );
    const cachedSnsData = sortedAbandonesSnsData.map(
      ({ isAbandoned: _, ...sns }) => ({ ...sns })
    );

    return {
      data: cachedSnsData,
    };
  }
);

const brokenSnsOverrides: Record<
  string,
  { name: string; tokenSymbol: string }
> = {
  // Overrided for CYCLES_TRANSFER_STATION as discussed in https://dfinity.slack.com/archives/C039M7YS6F6/p1733302975333649
  "ibahq-taaaa-aaaaq-aadna-cai": {
    name: "CYCLES_TRANSFER_STATION",
    tokenSymbol: "CTS",
  },
};

const fixBrokenSnsMetadataBasedOnId = (
  sns: CachedSnsDto
): CachedSnsDto & { isAbandoned?: boolean } => {
  const override = brokenSnsOverrides[sns.list_sns_canisters.root];

  // Required for the tokens and staking routes as they apply their own sort logic
  const hiddenCharacterToPushSnsToEndOfList = "\u200B";
  if (!nonNullish(override)) return sns;
  const newMeta = {
    ...sns.meta,
    name: `${hiddenCharacterToPushSnsToEndOfList}${sns.meta.name} (formerly ${override.name})`,
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
    isAbandoned: true,
  };
};

// Required for the proposals route as it doesnt apply sort logic
const sortedListBasedOnAbandoned = (
  list: (CachedSnsDto & { isAbandoned?: boolean })[]
) => [
  ...list.sort((a, b) => {
    if (a.isAbandoned && !b.isAbandoned) return 1;
    if (!a.isAbandoned && b.isAbandoned) return -1;

    return 0;
  }),
];
