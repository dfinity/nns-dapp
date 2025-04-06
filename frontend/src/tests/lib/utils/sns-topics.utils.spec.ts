import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import {
  getAllSnsNSFunctions,
  getSnsTopicFollowings,
  getSnsTopicInfoKey,
  getSnsTopicKeys,
  getTopicInfoBySnsTopicKey,
  insertIntoSnsTopicFollowings,
  removeFromSnsTopicFollowings,
  snsTopicToTopicKey,
} from "$lib/utils/sns-topics.utils";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction, SnsTopic } from "@dfinity/sns";
import { createMockSnsNeuron } from "../../mocks/sns-neurons.mock";

describe("sns-topics utils", () => {
  const neuronId1 = {
    id: Uint8Array.from([1, 2, 3]),
  };
  const neuronId2 = {
    id: Uint8Array.from([4, 5, 6]),
  };
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
      } as unknown as SnsTopic,
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
      expect(snsTopicToTopicKey({} as SnsTopic)).toBe("UnknownTopic");
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

  describe("getSnsTopicFollowings", () => {
    it("should return empty map if the topic_followees is not available/supported", () => {
      expect(
        getSnsTopicFollowings(
          createMockSnsNeuron({
            topicFollowees: {},
          })
        )
      ).toEqual([]);
      expect(
        getSnsTopicFollowings({
          ...createMockSnsNeuron({}),
        })
      ).toEqual([]);
    });

    it("should return a followee list", () => {
      expect(
        getSnsTopicFollowings(
          createMockSnsNeuron({
            topicFollowees: {
              DappCanisterManagement: [
                {
                  neuronId: neuronId1,
                  alias: "alias",
                },
              ],
              DaoCommunitySettings: [
                {
                  neuronId: neuronId1,
                  alias: "alias",
                },
                {
                  neuronId: neuronId2,
                },
              ],
            },
          })
        )
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1, alias: "alias" }],
        },
        {
          topic: "DaoCommunitySettings",
          followees: [
            { neuronId: neuronId1, alias: "alias" },
            {
              neuronId: neuronId2,
            },
          ],
        },
      ]);
    });
  });

  describe("insertIntoTopicFollowingMap", () => {
    it("should return empty list if the topic_followees is not available/supported", () => {
      expect(
        getSnsTopicFollowings(
          createMockSnsNeuron({
            topicFollowees: {},
          })
        )
      ).toEqual([]);

      expect(
        getSnsTopicFollowings({
          ...createMockSnsNeuron({}),
          topic_followees: undefined,
        })
      ).toEqual([]);
    });

    it("should return following list", () => {
      expect(
        getSnsTopicFollowings(
          createMockSnsNeuron({
            topicFollowees: {
              DappCanisterManagement: [
                {
                  neuronId: neuronId1,
                  alias: "alias",
                },
              ],
              DaoCommunitySettings: [
                {
                  neuronId: neuronId1,
                  alias: "alias",
                },
                {
                  neuronId: neuronId2,
                },
              ],
            },
          })
        )
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1, alias: "alias" }],
        },
        {
          topic: "DaoCommunitySettings",
          followees: [
            { neuronId: neuronId1, alias: "alias" },
            { neuronId: neuronId2 },
          ],
        },
      ]);
    });
  });

  describe("insertIntoSnsTopicFollowings", () => {
    it("should add new topic to follow", () => {
      expect(
        insertIntoSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1, alias: "alias" }],
            },
          ],
          topicsToFollow: ["DaoCommunitySettings"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1, alias: "alias" }],
        },
        {
          topic: "DaoCommunitySettings",
          followees: [{ neuronId: neuronId2 }],
        },
      ]);
    });

    it("should add new following to existent topics", () => {
      expect(
        insertIntoSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1, alias: "alias" }],
            },
          ],
          topicsToFollow: ["DappCanisterManagement"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [
            { neuronId: neuronId1, alias: "alias" },
            { neuronId: neuronId2 },
          ],
        },
      ]);
    });

    it("should prevent adding duplications", () => {
      expect(
        insertIntoSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId2 }],
            },
          ],
          topicsToFollow: ["DappCanisterManagement"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId2 }],
        },
      ]);
    });
  });

  describe("removeFromSnsTopicFollowings", () => {
    it("should remove neuron from the topic followees", () => {
      expect(
        removeFromSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [
                { neuronId: neuronId1, alias: "alias" },
                { neuronId: neuronId2 },
              ],
            },
          ],
          neuronId: neuronId1,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId2 }],
        },
      ]);
    });

    it("should remove topic entry when the only followee", () => {
      expect(
        removeFromSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1, alias: "alias" }],
            },
            {
              topic: "DaoCommunitySettings",
              followees: [{ neuronId: neuronId2 }],
            },
          ],
          neuronId: neuronId1,
        })
      ).toEqual([
        {
          topic: "DaoCommunitySettings",
          followees: [{ neuronId: neuronId2 }],
        },
      ]);
    });

    it("should remove nothing when not exists", () => {
      expect(
        removeFromSnsTopicFollowings({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1, alias: "alias" }],
            },
          ],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1, alias: "alias" }],
        },
      ]);
    });
  });
});
