import type { SnsTopicKey } from "$lib/types/sns";
import type {
  ListTopicsResponseWithUnknown,
  TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import {
  addSnsNeuronToFollowingsByTopics,
  getAllSnsNSFunctions,
  getLegacyFolloweesByTopics,
  getSnsTopicFollowings,
  getSnsTopicInfoKey,
  getSnsTopicKeys,
  getTopicInfoBySnsTopicKey,
  isSnsNeuronsFollowing,
  removeSnsNeuronFromFollowingsByTopics,
  snsTopicKeyToTopic,
  snsTopicToTopicKey,
} from "$lib/utils/sns-topics.utils";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { Principal } from "@dfinity/principal";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsTopic,
} from "@dfinity/sns";

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
  const nativeNsFunctionId = 1n;
  const nativeNsFunction: SnsNervousSystemFunction = {
    id: nativeNsFunctionId,
    name: "Native Function",
    description: ["Description 1"],
    function_type: [{ NativeNervousSystemFunction: {} }],
  };
  const genericNsFunctionId = 1001n;
  const genericNsFunction: SnsNervousSystemFunction = {
    id: genericNsFunctionId,
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
                },
              ],
              DaoCommunitySettings: [
                {
                  neuronId: neuronId1,
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
          followees: [{ neuronId: neuronId1 }],
        },
        {
          topic: "DaoCommunitySettings",
          followees: [
            { neuronId: neuronId1 },
            {
              neuronId: neuronId2,
            },
          ],
        },
      ]);
    });
  });

  describe("isSnsNeuronsFollowing", () => {
    it("returns true when the specified neuron ID is listed as a followee for the given topic", () => {
      expect(
        isSnsNeuronsFollowing({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
          ],
          topicKey: "DappCanisterManagement",
          neuronId: neuronId2,
        })
      ).toEqual(true);
    });

    it("returns false when the specified neuron ID is not listed as a followee for the given topic", () => {
      expect(
        isSnsNeuronsFollowing({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
          ],
          topicKey: "CriticalDappOperations",
          neuronId: neuronId2,
        })
      ).toEqual(false);

      expect(
        isSnsNeuronsFollowing({
          followings: [
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
          ],
          topicKey: "CriticalDappOperations",
          neuronId: neuronId2,
        })
      ).toEqual(false);

      expect(
        isSnsNeuronsFollowing({
          followings: [],
          topicKey: "CriticalDappOperations",
          neuronId: neuronId2,
        })
      ).toEqual(false);
    });
  });

  describe("addSnsNeuronToFollowingsByTopics", () => {
    it("should insert neuron ID into existing topics", () => {
      expect(
        addSnsNeuronToFollowingsByTopics({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }],
            },
          ],
          topics: ["DappCanisterManagement", "CriticalDappOperations"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
        },
        {
          topic: "CriticalDappOperations",
          followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
        },
      ]);
    });

    it("should insert neuron ID into non-existing topics", () => {
      expect(
        addSnsNeuronToFollowingsByTopics({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }],
            },
          ],
          topics: ["DappCanisterManagement", "CriticalDappOperations"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId2 }],
        },
        {
          topic: "CriticalDappOperations",
          followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
        },
      ]);
    });
  });

  describe("removeSnsNeuronFromFollowingsByTopics", () => {
    it("should remove neuron ID", () => {
      expect(
        removeSnsNeuronFromFollowingsByTopics({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
          ],
          topics: ["DappCanisterManagement", "CriticalDappOperations"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "CriticalDappOperations",
          followees: [{ neuronId: neuronId1 }],
        },
        {
          topic: "DappCanisterManagement",
          followees: [{ neuronId: neuronId1 }],
        },
      ]);

      expect(
        removeSnsNeuronFromFollowingsByTopics({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId2 }],
            },
          ],
          topics: ["CriticalDappOperations"],
          neuronId: neuronId2,
        })
      ).toEqual([
        {
          topic: "CriticalDappOperations",
          followees: [{ neuronId: neuronId1 }],
        },
      ]);
    });

    it("should not exclude empty followees", () => {
      expect(
        removeSnsNeuronFromFollowingsByTopics({
          followings: [
            {
              topic: "CriticalDappOperations",
              followees: [{ neuronId: neuronId1 }, { neuronId: neuronId2 }],
            },
            {
              topic: "DappCanisterManagement",
              followees: [{ neuronId: neuronId1 }],
            },
          ],
          topics: ["DappCanisterManagement", "CriticalDappOperations"],
          neuronId: neuronId1,
        })
      ).toEqual([
        {
          topic: "CriticalDappOperations",
          followees: [{ neuronId: neuronId2 }],
        },
        {
          topic: "DappCanisterManagement",
          followees: [],
        },
      ]);
    });
  });

  describe("getLegacyFolloweesByTopics", () => {
    const nativeNsFunctionId1 = 1n;
    const nativeNsFunction1: SnsNervousSystemFunction = {
      ...nativeNsFunction,
      id: nativeNsFunctionId1,
    };
    const nativeNsFunctionId2 = 2n;
    const nativeNsFunction2: SnsNervousSystemFunction = {
      ...nativeNsFunction,
      id: nativeNsFunctionId2,
    };
    const genericNsFunctionId1 = 1001n;
    const genericNsFunction1: SnsNervousSystemFunction = {
      ...genericNsFunction,
      id: genericNsFunctionId1,
    };
    const genericNsFunctionId2 = 1002n;
    const genericNsFunction2: SnsNervousSystemFunction = {
      ...genericNsFunction,
      id: genericNsFunctionId2,
    };
    const testTopicInfo1: TopicInfoWithUnknown = {
      ...knownTopicInfo,
      native_functions: [[nativeNsFunction1]],
      custom_functions: [[genericNsFunction1]],
    };
    const testTopicInfo2: TopicInfoWithUnknown = {
      ...knownTopicInfo,
      native_functions: [[nativeNsFunction2]],
      custom_functions: [[genericNsFunction2]],
    };

    it("returns all ns-function-based followees by topics", () => {
      const testNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [
          [nativeNsFunctionId1, { followees: [neuronId1] }],
          [nativeNsFunctionId2, { followees: [neuronId1, neuronId2] }],
          [genericNsFunctionId1, { followees: [neuronId2] }],
          [genericNsFunctionId2, { followees: [neuronId1, neuronId2] }],
        ],
      };

      expect(
        getLegacyFolloweesByTopics({
          neuron: testNeuron,
          topicInfos: [testTopicInfo1, testTopicInfo2],
        })
      ).toEqual([
        {
          nsFunction: nativeNsFunction1,
          followees: [neuronId1],
        },
        {
          nsFunction: nativeNsFunction2,
          followees: [neuronId1, neuronId2],
        },
        {
          nsFunction: genericNsFunction1,
          followees: [neuronId2],
        },
        {
          nsFunction: genericNsFunction2,
          followees: [neuronId1, neuronId2],
        },
      ]);

      expect(
        getLegacyFolloweesByTopics({
          neuron: testNeuron,
          topicInfos: [testTopicInfo1],
        })
      ).toEqual([
        {
          nsFunction: nativeNsFunction1,
          followees: [neuronId1],
        },
        {
          nsFunction: genericNsFunction1,
          followees: [neuronId2],
        },
      ]);

      expect(
        getLegacyFolloweesByTopics({
          neuron: testNeuron,
          topicInfos: [testTopicInfo2],
        })
      ).toEqual([
        {
          nsFunction: nativeNsFunction2,
          followees: [neuronId1, neuronId2],
        },
        {
          nsFunction: genericNsFunction2,
          followees: [neuronId1, neuronId2],
        },
      ]);
    });

    it("return empty array when no followees", () => {
      const testNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [],
      };

      expect(
        getLegacyFolloweesByTopics({
          neuron: testNeuron,
          topicInfos: [testTopicInfo1, testTopicInfo2],
        })
      ).toEqual([]);
    });

    it("return empty array when no topic infos", () => {
      const testNeuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [
          [nativeNsFunctionId1, { followees: [neuronId1] }],
          [nativeNsFunctionId2, { followees: [neuronId1, neuronId2] }],
          [genericNsFunctionId1, { followees: [neuronId2] }],
          [genericNsFunctionId2, { followees: [neuronId1, neuronId2] }],
        ],
      };

      expect(
        getLegacyFolloweesByTopics({
          neuron: testNeuron,
          topicInfos: [],
        })
      ).toEqual([]);
    });
  });
});
