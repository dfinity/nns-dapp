import type {
  FolloweesForTopic,
  NeuronId,
  NeuronInfo,
  Topic,
} from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";

export const getNnsTopicFollowings = (
  neuron: NeuronInfo
): FolloweesForTopic[] =>
  (neuron.fullNeuron?.followees ?? []).map(({ topic, followees }) => ({
    topic,
    followees: [...followees],
  }));

// Returns true if the given neuron is following the given topic.
export const isNnsNeuronFollowingTopic = ({
  followings,
  neuronId,
  topic,
}: {
  followings: FolloweesForTopic[];
  neuronId: NeuronId;
  topic: Topic;
}): boolean => {
  const topicFollowees = followings.find(
    (following) => following.topic === topic
  )?.followees;
  if (isNullish(topicFollowees)) {
    return false;
  }
  return topicFollowees.includes(neuronId);
};

// Returns true if the given neuron is following all the given topics.
export const isNnsNeuronFollowingAllTopics = ({
  followings,
  neuronId,
  topics,
}: {
  followings: FolloweesForTopic[];
  neuronId: NeuronId;
  topics: Topic[];
}): boolean =>
  topics.every((topic) =>
    isNnsNeuronFollowingTopic({ followings, neuronId, topic })
  );

// Adds a neuron to the list of followees for the given topics
// (the result contains only the provided topics).
export const addNnsNeuronToFollowingsByTopics = ({
  followings,
  topics,
  neuronId,
}: {
  followings: FolloweesForTopic[];
  topics: Topic[];
  neuronId: NeuronId;
}): FolloweesForTopic[] =>
  Array.from(new Set(topics))
    // Filter out topics that are already followed by the neuron to avoid duplications.
    .filter(
      (topic) =>
        !isNnsNeuronFollowingTopic({
          followings,
          neuronId,
          topic,
        })
    )
    .map((topic) => {
      const existingFollowees =
        followings.find((following) => following.topic === topic)?.followees ??
        [];
      return {
        topic,
        followees: [...existingFollowees, neuronId],
      };
    });

// Removes a neuron from the followees list for the given topics
// (Returns only the topics where the neuron was actually removed).
export const removeNnsNeuronFromFollowingsByTopics = ({
  followings,
  topics,
  neuronId,
}: {
  followings: FolloweesForTopic[];
  topics: Topic[];
  neuronId: NeuronId;
}): FolloweesForTopic[] =>
  followings
    .filter(
      ({ topic, followees }) =>
        topics.includes(topic) && followees.includes(neuronId)
    )
    .map(({ topic, followees }) => ({
      topic,
      followees: followees.filter((followee) => followee !== neuronId),
    }));
