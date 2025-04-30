import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import { convertDtoToListTopicsResponse } from "$lib/utils/sns-aggregator-converters.utils";
import type { Principal } from "@dfinity/principal";
import { fromNullable, isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface SnsParametersStore {
  [rootCanisterId: RootCanisterIdText]:
    | ListTopicsResponseWithUnknown
    | undefined;
}

/**
 * A store containing SNS topics for each project.
 * Returns undefined for projects where topics are not supported.
 */
export const snsTopicsStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) =>
    isNullish(sns?.topics)
      ? undefined
      : convertDtoToListTopicsResponse(sns.topics)
  );

// TODO(sns-topics): Consider this to be a utility function.
export const createSnsTopicsProjectStore = (
  rootCanisterId: Principal | null | undefined
): Readable<Array<TopicInfoWithUnknown> | undefined> =>
  derived<typeof snsTopicsStore, Array<TopicInfoWithUnknown> | undefined>(
    snsTopicsStore,
    ($snsTopicStore) => {
      const rootCanisterIdText = rootCanisterId?.toText();
      if (isNullish(rootCanisterIdText)) {
        return undefined;
      }

      const topicResponse = $snsTopicStore[rootCanisterIdText];
      return nonNullish(topicResponse)
        ? fromNullable(topicResponse.topics)
        : undefined;
    }
  );

export const createSnsTopicsProposalsFilteringStore = (
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
