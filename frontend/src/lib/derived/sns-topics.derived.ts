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
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
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
      if (isNullish(topicResponse)) return undefined;

      const topics = fromNullable(topicResponse.topics);
      if (isNullish(topics)) return undefined;

      // sorts filters with critical topics first, then alphabetically within each group
      return topics.sort((a, b) => {
        const isACritical = fromDefinedNullable(a.is_critical);
        const isBCritical = fromDefinedNullable(b.is_critical);

        if (isACritical && !isBCritical) return -1;
        if (!isACritical && isBCritical) return 1;

        const nameOfA = fromDefinedNullable(a.name);
        const nameOfB = fromDefinedNullable(b.name);

        return nameOfA.localeCompare(nameOfB);
      });
    }
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
