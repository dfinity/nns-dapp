import FollowNeuronsModal from "$lib/modals/neurons/FollowNeuronsModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { isNotVisible } from "$tests/utils/utils.test-utils";
import { Topic } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    removeFollowee: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn(),
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
          followees: [27n, 28n],
        },
      ],
    },
  };

  const fillNeuronStore = () =>
    neuronsStore.setNeurons({
      neurons: [neuronFollowing],
      certified: true,
    });

  beforeAll(() => fillNeuronStore());

  it("renders title", () => {
    const { queryByText } = render(FollowNeuronsModal, {
      props: {
        neuronId: neuronFollowing.neuronId,
      },
    });

    expect(queryByText(en.neurons.follow_neurons_screen)).toBeInTheDocument();
  });

  it("renders badge with numbers of followees on the topic", () => {
    const { queryByTestId } = render(FollowNeuronsModal, {
      props: {
        neuronId: neuronFollowing.neuronId,
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
        neuronId: neuronFollowing.neuronId,
      },
    });

    const topicSection = queryByTestId(
      `follow-topic-${Topic.ExchangeRate}-section`
    );
    expect(topicSection).not.toBeNull();

    if (topicSection !== null) {
      const collapsibleContent = topicSection.querySelector(
        "[data-tid='collapsible-content']"
      );
      expect(isNotVisible(collapsibleContent)).toBe(true);

      const collapsibleButton = topicSection.querySelector(
        '[data-tid="collapsible-expand-button"]'
      );
      expect(collapsibleButton).not.toBeNull();

      collapsibleButton && (await fireEvent.click(collapsibleButton));

      await waitFor(() => expect(isNotVisible(collapsibleContent)).toBe(false));
    }
  });
});
