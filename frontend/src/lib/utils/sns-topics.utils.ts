import type { SnsTopicFollowing, SnsTopicKey } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
  UnknownTopic,
} from "$lib/types/sns-aggregator";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsNeuronId,
  SnsTopic,
} from "@dfinity/sns";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";

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
  listTopics,
}: {
  topicKey: SnsTopicKey;
  listTopics: ListTopicsResponseWithUnknown;
}): TopicInfoWithUnknown | undefined =>
  (fromNullable(listTopics.topics) ?? []).find(
    (topicInfo) => getSnsTopicInfoKey(topicInfo) === topicKey
  );

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

export const isSnsNeuronsAlreadyFollowing = ({
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
        !isSnsNeuronsAlreadyFollowing({
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
