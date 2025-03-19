import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import {
  getAllSnsNSFunctions,
  getSnsTopicInfoKey,
  getSnsTopicKey,
  getSnsTopicKeys,
  getTopicInfoBySnsTopicKey,
} from "$lib/utils/sns-topics.utils";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import type { Topic } from "@dfinity/sns/dist/candid/sns_governance";

describe("sns-topics utils", () => {
  const canisterIdString = "aaaaa-aa";
  const canisterId = Principal.fromText(canisterIdString);
  const method = "method";
  const targetMethod = "target_method_name";
  const nativeNsFunction: SnsNervousSystemFunction = {
    id: 1n,
    name: "Native Function",
    description: ["Description 1"],
    function_type: [{ NativeNervousSystemFunction: {} }],
  };
  const genericNsFunction: SnsNervousSystemFunction = {
    id: 1001n,
    name: "Custom Function",
    description: ["Description 3"],
    function_type: [
      {
        GenericNervousSystemFunction: {
          validator_canister_id: [canisterId],
          target_canister_id: [canisterId],
          validator_method_name: [method],
          target_method_name: [targetMethod],
          topic: [
            {
              DappCanisterManagement: null,
            },
          ],
        },
      },
    ],
  };
  const knownTopicInfo: TopicInfoWithUnknown = {
    native_functions: [[nativeNsFunction]],
    topic: [
      {
        DaoCommunitySettings: null,
      },
    ],
    is_critical: [true],
    name: ["Unknown topic name"],
    description: ["Unknown topic desctiption"],
    custom_functions: [[genericNsFunction]],
  };
  const completelyUnknownTopicInfo: TopicInfoWithUnknown = {
    native_functions: [[nativeNsFunction]],
    topic: [
      {
        CompletelyUnknownTopic: null,
      } as unknown as Topic,
    ],
    is_critical: [true],
    name: ["Unknown topic name"],
    description: ["Unknown topic desctiption"],
    custom_functions: [[]],
  };
  const listTopics: ListTopicsResponseWithUnknown = {
    topics: [[knownTopicInfo, completelyUnknownTopicInfo]],
    uncategorized_functions: [],
  };

  describe("getSnsTopicKey", () => {
    it("should return topic key", () => {
      expect(getSnsTopicKey({ DappCanisterManagement: null })).toBe(
        "DappCanisterManagement"
      );
      expect(getSnsTopicKey({ DaoCommunitySettings: null })).toBe(
        "DaoCommunitySettings"
      );
      expect(getSnsTopicKey({ ApplicationBusinessLogic: null })).toBe(
        "ApplicationBusinessLogic"
      );
      expect(getSnsTopicKey({ CriticalDappOperations: null })).toBe(
        "CriticalDappOperations"
      );
      expect(getSnsTopicKey({ TreasuryAssetManagement: null })).toBe(
        "TreasuryAssetManagement"
      );
      expect(getSnsTopicKey({ Governance: null })).toBe("Governance");
      expect(getSnsTopicKey({ SnsFrameworkManagement: null })).toBe(
        "SnsFrameworkManagement"
      );
      expect(getSnsTopicKey({ UnknownTopic: null })).toBe("UnknownTopic");
    });

    it("should return UnknownTopic if topic is unknown", () => {
      expect(getSnsTopicKey({} as Topic)).toBe("UnknownTopic");
    });
  });

  describe("getSnsTopicInfoKey", () => {
    it("should return key of known topics", () => {
      expect(getSnsTopicInfoKey(knownTopicInfo)).toBe("DaoCommunitySettings");
    });

    it('should return "UnknownTopic" key for unknown topics', () => {
      expect(getSnsTopicInfoKey(completelyUnknownTopicInfo)).toBe(
        "UnknownTopic"
      );
    });
  });

  describe("getSnsTopicKeys", () => {
    it("should return topic keys", () => {
      expect(getSnsTopicKeys(listTopics)).toEqual([
        "DaoCommunitySettings",
        "UnknownTopic",
      ]);
    });
  });

  describe("getTopicInfoBySnsTopicKey", () => {
    it("should return topic info", () => {
      expect(
        getTopicInfoBySnsTopicKey({
          topicKey: "DaoCommunitySettings",
          listTopics,
        })
      ).toEqual(knownTopicInfo);
    });

    it("should return undefined when no topic info found", () => {
      expect(
        getTopicInfoBySnsTopicKey({
          topicKey: "DappCanisterManagement",
          listTopics,
        })
      ).toEqual(undefined);
    });
  });

  describe("getAllSnsNSFunctions", () => {
    it("should return all available ns functions", () => {
      expect(getAllSnsNSFunctions(knownTopicInfo)).toEqual([
        nativeNsFunction,
        genericNsFunction,
      ]);
    });
  });
});
