import { ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import type { SnsTopicsStore } from "$lib/derived/sns-topics.derived";
import type {
  SnsLegacyFollowings,
  SnsTopicFollowing,
  SnsTopicKey,
} from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
  UnknownTopic,
} from "$lib/types/sns-aggregator";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import type { Principal } from "@dfinity/principal";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsNeuronId,
  SnsTopic,
} from "@dfinity/sns";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";

export const snsTopicToTopicKey = (
  topic: SnsTopic | UnknownTopic
): SnsTopicKey => {
  // We can't ensure that all the topicKeys are present in this list.
  const topicKeys: SnsTopicKey[] = [
    "DappCanisterManagement",
    "DaoCommunitySettings",
    "ApplicationBusinessLogic",
    "CriticalDappOperations",
    "TreasuryAssetManagement",
    "Governance",
    "SnsFrameworkManagement",
    "UnknownTopic",
  ];
  const topicKey = Object.keys(topic).find((key) =>
    topicKeys.includes(key as SnsTopicKey)
  ) as SnsTopicKey | undefined;

  if (topicKey) return topicKey as SnsTopicKey;
  // This should not happen, but for safety we return known "UnknownTopic" to not break the logic.
  return "UnknownTopic";
};

export const snsTopicKeyToTopic = (
  topic: SnsTopicKey
): SnsTopic | UnknownTopic => {
  switch (topic) {
    case "DappCanisterManagement":
      return { DappCanisterManagement: null };
    case "DaoCommunitySettings":
      return { DaoCommunitySettings: null };
    case "ApplicationBusinessLogic":
      return { ApplicationBusinessLogic: null };
    case "CriticalDappOperations":
      return { CriticalDappOperations: null };
    case "TreasuryAssetManagement":
      return { TreasuryAssetManagement: null };
    case "Governance":
      return { Governance: null };
    case "SnsFrameworkManagement":
      return { SnsFrameworkManagement: null };
  }

  console.error("Unknown topic:", topic);
  return { UnknownTopic: null };
};

export const getSnsTopicInfoKey = (
  topicInfo: TopicInfoWithUnknown
): SnsTopicKey =>
  snsTopicToTopicKey(fromNullable(topicInfo.topic) as SnsTopic | UnknownTopic);

// Returns all available SNS topics keys
export const getSnsTopicKeys = (
  listTopics: ListTopicsResponseWithUnknown
): SnsTopicKey[] =>
  (fromNullable(listTopics.topics) ?? []).map(getSnsTopicInfoKey);

export const getTopicInfoBySnsTopicKey = ({
  topicKey,
  topics,
}: {
  topicKey: SnsTopicKey;
  topics: Array<TopicInfoWithUnknown>;
}): TopicInfoWithUnknown | undefined =>
  topics.find((topicInfo) => getSnsTopicInfoKey(topicInfo) === topicKey);

// Combines native and generic nervous system functions
export const getAllSnsNSFunctions = (
  topicInfo: TopicInfoWithUnknown
): SnsNervousSystemFunction[] => [
  ...(fromNullable(topicInfo.native_functions) ?? []),
  ...(fromNullable(topicInfo.custom_functions) ?? []),
];

export const getSnsTopicFollowings = (
  neuron: SnsNeuron
): SnsTopicFollowing[] => {
  const topicFollowees =
    fromNullable(neuron.topic_followees)?.topic_id_to_followees ?? [];

  return topicFollowees.map(([, { topic, followees }]) => ({
    topic: snsTopicToTopicKey(fromDefinedNullable(topic)),
    followees: followees.map(({ neuron_id, alias }) => ({
      neuronId: fromDefinedNullable(neuron_id),
      alias: fromNullable(alias),
    })),
  }));
};

export const isSnsNeuronsFollowing = ({
  followings,
  neuronId,
  topicKey,
}: {
  followings: SnsTopicFollowing[];
  neuronId: SnsNeuronId;
  topicKey: SnsTopicKey;
}): boolean => {
  const topicFollowees = followings.find(
    (following) => following.topic === topicKey
  )?.followees;
  if (!topicFollowees) {
    return false;
  }
  return topicFollowees.some(
    (followee) =>
      subaccountToHexString(followee.neuronId.id) ===
      subaccountToHexString(neuronId.id)
  );
};

// Adds a neuron to the list of followees for the given topics
// (the result contains only the provided topics).
export const addSnsNeuronToFollowingsByTopics = ({
  followings,
  topics,
  neuronId,
}: {
  followings: SnsTopicFollowing[];
  topics: SnsTopicKey[];
  neuronId: SnsNeuronId;
}): SnsTopicFollowing[] =>
  topics
    // Filter out topics that are already followed by the neuron to avoid duplications.
    .filter(
      (topicKey) =>
        !isSnsNeuronsFollowing({
          followings,
          neuronId,
          topicKey,
        })
    )
    .map((topicKey) => {
      const topicFollowees = followings.find(
        (following) => following.topic === topicKey
      )?.followees;
      return {
        topic: topicKey,
        followees: [
          ...(topicFollowees ?? []),
          {
            neuronId,
          },
        ],
      };
    });

// Removes a neuron from the followees list for the given topics
// (Returns only the topics where the neuron was actually removed).
export const removeSnsNeuronFromFollowingsByTopics = ({
  followings,
  topics,
  neuronId,
}: {
  followings: SnsTopicFollowing[];
  topics: SnsTopicKey[];
  neuronId: SnsNeuronId;
}): SnsTopicFollowing[] =>
  followings
    // Filter out topics that are not in the provided list.
    .filter((following) => topics.includes(following.topic))
    .map((following) => ({
      ...following,
      followees: following.followees.filter(
        (followee) =>
          subaccountToHexString(followee.neuronId.id) !==
          subaccountToHexString(neuronId.id)
      ),
    }));

// Returns NS-functions-based followees of the neuron for the specified topics.
export const getLegacyFolloweesByTopics = ({
  neuron,
  topicInfos,
}: {
  neuron: SnsNeuron;
  topicInfos: TopicInfoWithUnknown[];
}): Array<SnsLegacyFollowings> => {
  const topicsNsFunctionMap = new Map<bigint, SnsNervousSystemFunction>(
    topicInfos
      .flatMap(getAllSnsNSFunctions)
      .map((nsFunction) => [nsFunction.id, nsFunction])
  );

  return neuron.followees.reduce<SnsLegacyFollowings[]>(
    (acc, [id, { followees }]) => {
      const nsFunction = topicsNsFunctionMap.get(id);
      return nonNullish(nsFunction) ? [...acc, { nsFunction, followees }] : acc;
    },
    []
  );
};

// Returns the catch-all SNS followees of the neuron.
// Because the catch-all is not part of any topic, we need to get it from nsFunctions.
export const getCatchAllSnsLegacyFollowings = ({
  neuron,
  nsFunctions,
}: {
  neuron: SnsNeuron;
  nsFunctions: SnsNervousSystemFunction[];
}): SnsLegacyFollowings | undefined => {
  const nsFunction = nsFunctions.find(
    (nsFunction) => nsFunction.id === ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID
  );
  // Find the followees in a list where each item is a tuple of `[nsFunctionId, Followee[]]`
  const followees = neuron.followees.find(
    ([id]) => id === ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID
  )?.[1]?.followees;
  return isNullish(nsFunction) || isNullish(followees)
    ? undefined
    : {
        nsFunction,
        followees,
      };
};

// Returns the sorted list of topics for the given project.
// The topics are sorted with critical topics first, then alphabetically within each group.
export const getSnsTopicsByProject = ({
  rootCanisterId,
  snsTopicsStore,
}: {
  rootCanisterId: Principal | null | undefined;
  snsTopicsStore: SnsTopicsStore;
}): Array<TopicInfoWithUnknown> | undefined => {
  const rootCanisterIdText = rootCanisterId?.toText();
  if (isNullish(rootCanisterIdText)) {
    return undefined;
  }

  const topicResponse = snsTopicsStore[rootCanisterIdText];
  if (isNullish(topicResponse)) return undefined;

  const topics = fromNullable(topicResponse.topics);
  if (isNullish(topics)) return undefined;

  // sorts topics with critical topics first, then alphabetically within each group
  return topics.sort((a, b) => {
    const isACritical = fromDefinedNullable(a.is_critical);
    const isBCritical = fromDefinedNullable(b.is_critical);

    if (isACritical && !isBCritical) return -1;
    if (!isACritical && isBCritical) return 1;

    const nameOfA = fromDefinedNullable(a.name);
    const nameOfB = fromDefinedNullable(b.name);

    return nameOfA.localeCompare(nameOfB);
  });
};
