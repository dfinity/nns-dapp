/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import FollowNeuronsModal from "../../../../lib/modals/neurons/FollowNeuronsModal.svelte";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    removeFollowee: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

describe("FollowNeuronsModal", () => {
  const neuronFollowing = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: [BigInt(27), BigInt(28)],
        },
      ],
    },
  };
  it("renders title", () => {
    const { queryByText } = render(FollowNeuronsModal, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(queryByText(en.neurons.follow_neurons_screen)).toBeInTheDocument();
  });

  it("renders badge with numbers of followees on the topic", () => {
    const { queryByTestId } = render(FollowNeuronsModal, {
      props: {
        neuron: neuronFollowing,
      },
    });

    const badgeExchange = queryByTestId(
      `topic-${Topic.ExchangeRate}-followees-badge`
    );

    expect(badgeExchange).not.toBeNull();
    expect(badgeExchange?.innerHTML).toBe("2");

    const badgeGovernance = queryByTestId(
      `topic-${Topic.Governance}-followees-badge`
    );

    expect(badgeGovernance).not.toBeNull();
    expect(badgeGovernance?.innerHTML).toBe("0");
  });

  it("displays the followees of the user in specific topic", async () => {
    const { queryByTestId } = render(FollowNeuronsModal, {
      props: {
        neuron: neuronFollowing,
      },
    });

    const topicSection = queryByTestId(
      `follow-topic-${Topic.ExchangeRate}-section`
    );
    expect(topicSection).not.toBeNull();

    if (topicSection !== null) {
      const followeeElements = topicSection?.querySelectorAll(
        '[data-tid="current-followee-item"]'
      );

      expect(followeeElements.length).toBe(2);
      expect(followeeElements[0]).not.toBeVisible();
      const collapsibleButton = topicSection.querySelector(
        '[data-tid="collapsible-expand-button"]'
      );
      expect(collapsibleButton).not.toBeNull();

      collapsibleButton && (await fireEvent.click(collapsibleButton));

      expect(followeeElements[0]).toBeVisible();
    }
  });
});
