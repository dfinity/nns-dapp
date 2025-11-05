import {
  addNnsNeuronToFollowingsByTopics,
  getNnsTopicFollowings,
  isNnsNeuronFollowingAllTopics,
  isNnsNeuronFollowingTopic,
  removeNnsNeuronFromFollowingsByTopics,
} from "$lib/utils/nns-topics.utils";
import { createMockNeuron } from "$tests/mocks/neurons.mock";
import { Topic, type FolloweesForTopic, type NeuronId } from "@dfinity/nns";

describe("nns-topics.utils", () => {
  const mockNeuronId1 = 123n as NeuronId;
  const mockNeuronId2 = 456n as NeuronId;
  const mockNeuronId3 = 789n as NeuronId;

  const mockFollowings: FolloweesForTopic[] = [
    {
      topic: Topic.Governance,
      followees: [mockNeuronId1, mockNeuronId2],
    },
    {
      topic: Topic.ExchangeRate,
      followees: [mockNeuronId1],
    },
    {
      topic: Topic.NetworkEconomics,
      followees: [mockNeuronId2, mockNeuronId3],
    },
  ];

  describe("getNnsTopicFollowings", () => {
    it("should return followings from neuron's fullNeuron.followees", () => {
      const mockNeuron = createMockNeuron(1);
      mockNeuron.fullNeuron.followees = [
        {
          topic: Topic.Governance,
          followees: [mockNeuronId1, mockNeuronId2],
        },
        {
          topic: Topic.ExchangeRate,
          followees: [mockNeuronId1],
        },
      ];

      const result = getNnsTopicFollowings(mockNeuron);

      expect(result).toEqual([
        {
          topic: Topic.Governance,
          followees: [mockNeuronId1, mockNeuronId2],
        },
        {
          topic: Topic.ExchangeRate,
          followees: [mockNeuronId1],
        },
      ]);
    });

    it("should return empty array when neuron has no followees", () => {
      const mockNeuron = createMockNeuron(1);
      mockNeuron.fullNeuron!.followees = [];

      const result = getNnsTopicFollowings(mockNeuron);

      expect(result).toEqual([]);
    });
  });

  describe("isNnsNeuronFollowingTopic", () => {
    it("should return true when neuron is following the topic", () => {
      const result = isNnsNeuronFollowingTopic({
        followings: mockFollowings,
        neuronId: mockNeuronId1,
        topic: Topic.Governance,
      });

      expect(result).toBe(true);
    });

    it("should return false when neuron is not following the topic", () => {
      const result = isNnsNeuronFollowingTopic({
        followings: mockFollowings,
        neuronId: mockNeuronId3,
        topic: Topic.Governance,
      });

      expect(result).toBe(false);
    });

    it("should return false when topic is not in followings", () => {
      const result = isNnsNeuronFollowingTopic({
        followings: mockFollowings,
        neuronId: mockNeuronId1,
        topic: Topic.NeuronManagement,
      });

      expect(result).toBe(false);
    });

    it("should return false when followings is empty", () => {
      const result = isNnsNeuronFollowingTopic({
        followings: [],
        neuronId: mockNeuronId1,
        topic: Topic.Governance,
      });

      expect(result).toBe(false);
    });
  });

  describe("isNnsNeuronFollowingAllTopics", () => {
    it("should return true when neuron is following all specified topics", () => {
      const result = isNnsNeuronFollowingAllTopics({
        followings: mockFollowings,
        neuronId: mockNeuronId1,
        topics: [Topic.Governance, Topic.ExchangeRate],
      });

      expect(result).toBe(true);
    });

    it("should return false when neuron is not following all specified topics", () => {
      const result = isNnsNeuronFollowingAllTopics({
        followings: mockFollowings,
        neuronId: mockNeuronId1,
        topics: [Topic.Governance, Topic.NetworkEconomics],
      });

      expect(result).toBe(false);
    });

    it("should return false when followings is empty but topics are specified", () => {
      const result = isNnsNeuronFollowingAllTopics({
        followings: [],
        neuronId: mockNeuronId1,
        topics: [Topic.Governance],
      });

      expect(result).toBe(false);
    });
  });

  describe("addNnsNeuronToFollowingsByTopics", () => {
    it("should add neuron to new topics", () => {
      const result = addNnsNeuronToFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.NeuronManagement, Topic.SubnetManagement],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.NeuronManagement,
          followees: [mockNeuronId1],
        },
        {
          topic: Topic.SubnetManagement,
          followees: [mockNeuronId1],
        },
      ]);
    });

    it("should add neuron to existing topic without existing followees", () => {
      const followingsWithoutFollowees: FolloweesForTopic[] = [];

      const result = addNnsNeuronToFollowingsByTopics({
        followings: followingsWithoutFollowees,
        topics: [Topic.Governance],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.Governance,
          followees: [mockNeuronId1],
        },
      ]);
    });

    it("should add neuron to existing topic with existing followees", () => {
      const result = addNnsNeuronToFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.NetworkEconomics],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.NetworkEconomics,
          followees: [mockNeuronId2, mockNeuronId3, mockNeuronId1],
        },
      ]);
    });

    it("should filter out topics where neuron is already following", () => {
      const result = addNnsNeuronToFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.Governance, Topic.NeuronManagement],
        neuronId: mockNeuronId1,
      });

      // Should only return NeuronManagement since neuron is already following Governance
      expect(result).toEqual([
        {
          topic: Topic.NeuronManagement,
          followees: [mockNeuronId1],
        },
      ]);
    });

    it("should return empty array when all topics are already followed", () => {
      const result = addNnsNeuronToFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.Governance, Topic.ExchangeRate],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([]);
    });
  });

  describe("removeNnsNeuronFromFollowingsByTopics", () => {
    it("should remove neuron from specified topics", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.Governance],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.Governance,
          followees: [mockNeuronId2],
        },
      ]);
    });

    it("should remove neuron from multiple topics", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.Governance, Topic.ExchangeRate],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.Governance,
          followees: [mockNeuronId2],
        },
        {
          topic: Topic.ExchangeRate,
          followees: [],
        },
      ]);
    });

    it("should return empty array when neuron is not following any specified topics", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.NeuronManagement],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([]);
    });

    it("should return empty array when topics are not in followings", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.NeuronManagement, Topic.SubnetManagement],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([]);
    });

    it("should only return topics where neuron was actually removed", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.Governance, Topic.NetworkEconomics],
        neuronId: mockNeuronId1,
      });

      // Should only return Governance since neuron1 is not following NetworkEconomics
      expect(result).toEqual([
        {
          topic: Topic.Governance,
          followees: [mockNeuronId2],
        },
      ]);
    });

    it("should handle removing neuron that is the only followee", () => {
      const result = removeNnsNeuronFromFollowingsByTopics({
        followings: mockFollowings,
        topics: [Topic.ExchangeRate],
        neuronId: mockNeuronId1,
      });

      expect(result).toEqual([
        {
          topic: Topic.ExchangeRate,
          followees: [],
        },
      ]);
    });
  });
});
