import type { SnsTopicKey } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import {
  getAllSnsNSFunctions,
  getSnsTopicInfoKey,
  getSnsTopicKeys,
  getTopicInfoBySnsTopicKey,
  snsTopicKeyToTopic,
  snsTopicToTopicKey,
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
    name: ["Known topic name"],
    description: ["Known topic description"],
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
    description: ["Unknown topic description"],
    custom_functions: [[]],
  };
  const listTopics: ListTopicsResponseWithUnknown = {
    topics: [[knownTopicInfo, completelyUnknownTopicInfo]],
    uncategorized_functions: [],
  };

  // ic-js type: https://github.com/dfinity/ic-js/blob/1a4d3f02d4cfebf47c199a4fdc376e2f62a84746/packages/sns/candid/sns_governance_test.did#L867C1-L875C3
  describe("snsTopicKeyToTopic", () => {
    it("converts aggregator topic to ic-js types", () => {
      const spyOnConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(snsTopicKeyToTopic("DappCanisterManagement")).toEqual({
        DappCanisterManagement: null,
      });
      expect(snsTopicKeyToTopic("DaoCommunitySettings")).toEqual({
        DaoCommunitySettings: null,
      });
      expect(snsTopicKeyToTopic("ApplicationBusinessLogic")).toEqual({
        ApplicationBusinessLogic: null,
      });
      expect(snsTopicKeyToTopic("CriticalDappOperations")).toEqual({
        CriticalDappOperations: null,
      });
      expect(snsTopicKeyToTopic("TreasuryAssetManagement")).toEqual({
        TreasuryAssetManagement: null,
      });
      expect(snsTopicKeyToTopic("Governance")).toEqual({
        Governance: null,
      });
      expect(snsTopicKeyToTopic("SnsFrameworkManagement")).toEqual({
        SnsFrameworkManagement: null,
      });

      expect(spyOnConsoleError).not.toHaveBeenCalled();
    });

    it("returns UnknownTopic if topic is unknown", () => {
      const spyOnConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(snsTopicKeyToTopic("An Unknown Topic" as SnsTopicKey)).toEqual({
        UnknownTopic: null,
      });

      expect(spyOnConsoleError).toHaveBeenCalledTimes(1);
      expect(spyOnConsoleError).toHaveBeenCalledWith(
        "Unknown topic:",
        "An Unknown Topic"
      );
    });
  });

  describe("snsTopicToTopicKey", () => {
    it("should return topic key", () => {
      expect(snsTopicToTopicKey({ DappCanisterManagement: null })).toBe(
        "DappCanisterManagement"
      );
      expect(snsTopicToTopicKey({ DaoCommunitySettings: null })).toBe(
        "DaoCommunitySettings"
      );
      expect(snsTopicToTopicKey({ ApplicationBusinessLogic: null })).toBe(
        "ApplicationBusinessLogic"
      );
      expect(snsTopicToTopicKey({ CriticalDappOperations: null })).toBe(
        "CriticalDappOperations"
      );
      expect(snsTopicToTopicKey({ TreasuryAssetManagement: null })).toBe(
        "TreasuryAssetManagement"
      );
      expect(snsTopicToTopicKey({ Governance: null })).toBe("Governance");
      expect(snsTopicToTopicKey({ SnsFrameworkManagement: null })).toBe(
        "SnsFrameworkManagement"
      );
      expect(snsTopicToTopicKey({ UnknownTopic: null })).toBe("UnknownTopic");
    });

    it("should return UnknownTopic if topic is unknown", () => {
      expect(snsTopicToTopicKey({} as Topic)).toBe("UnknownTopic");
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
