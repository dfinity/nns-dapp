import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import { convertDtoToListTopicsResponse } from "$lib/utils/sns-aggregator-converters.utils";
import { getSnsTopicsByProject } from "$lib/utils/sns-topics.utils";
import type { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface SnsTopicsStore {
  [rootCanisterId: RootCanisterIdText]:
    | ListTopicsResponseWithUnknown
    | undefined;
}

/**
 * A store containing SNS topics for each project.
 * Returns undefined for projects where topics are not supported.
 */
export const snsTopicsStore: Readable<SnsTopicsStore> = snsAggregatorDerived(
  (sns) =>
    isNullish(sns?.topics)
      ? undefined
      : convertDtoToListTopicsResponse(sns.topics)
);

export const createSnsTopicsProjectStore = (
  rootCanisterId: Principal | null | undefined
): Readable<Array<TopicInfoWithUnknown> | undefined> =>
  derived<typeof snsTopicsStore, Array<TopicInfoWithUnknown> | undefined>(
    snsTopicsStore,
    ($snsTopicStore) =>
      getSnsTopicsByProject({
        rootCanisterId,
        snsTopicsStore: $snsTopicStore,
      })
  );

export const createEnableFilteringBySnsTopicsStore = (
  rootCanisterId: Principal | null | undefined
): Readable<boolean> =>
  derived(
    [
      createSnsTopicsProjectStore(rootCanisterId),
      unsupportedFilterByTopicSnsesStore,
      ENABLE_SNS_TOPICS,
    ],
    ([topics, $unsupportedFilterByTopicSnsesStore, $ENABLE_SNS_TOPICS]) => {
      if (isNullish(rootCanisterId)) return false;

      const isTopicFilteringUnsupported =
        $unsupportedFilterByTopicSnsesStore.includes(rootCanisterId.toText());

      return (
        $ENABLE_SNS_TOPICS && nonNullish(topics) && !isTopicFilteringUnsupported
      );
    }
  );
