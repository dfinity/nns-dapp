import type { SnsTopicKey } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
  UnknownTopic,
} from "$lib/types/sns-aggregator";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import type { Topic } from "@dfinity/sns/dist/candid/sns_governance";
import { fromNullable } from "@dfinity/utils";

export const snsTopicToTopicKey = (
  topic: Topic | UnknownTopic
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
): Topic | UnknownTopic => {
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
  snsTopicToTopicKey(fromNullable(topicInfo.topic) as Topic | UnknownTopic);

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
