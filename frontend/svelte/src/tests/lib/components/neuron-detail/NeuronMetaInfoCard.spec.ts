/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import NeuronMetaInfoCard from "../../../../lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
import { joinCommunityFund } from "../../../../lib/services/neurons.services";
import { formatVotingPower } from "../../../../lib/utils/neuron.utils";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    joinCommunityFund: jest.fn().mockResolvedValue(undefined),
  };
});

describe("NeuronMetaInfoCard", () => {
  it("renders neuron id", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(queryByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("renders a NeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(queryByTestId("neuron-card-title")).toBeInTheDocument();
  });

  it("renders voting power", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).toBeInTheDocument();
    expect(
      queryByText(formatVotingPower(mockNeuron.votingPower))
    ).toBeInTheDocument();
  });

  it("doest not render voting power if none", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: {
        ...mockNeuron,
        votingPower: undefined,
      },
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.split_neuron)).toBeInTheDocument();
  });

  it("allows neuron to join community fund", async () => {
    const { queryByTestId } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    const joinButton = queryByTestId("join-community-fund-button");
    expect(joinButton).not.toBeNull();

    joinButton && (await fireEvent.click(joinButton));

    const modal = queryByTestId("join-community-fund-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(joinCommunityFund).toBeCalled();
  });
});
