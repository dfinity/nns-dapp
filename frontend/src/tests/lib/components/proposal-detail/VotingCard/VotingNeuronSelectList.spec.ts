/**
 * @jest-environment jsdom
 */

import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("VotingNeuronSelectList", () => {
  const neuron1 = {
    ...mockNeuron,
    neuronId: BigInt(111),
    votingPower: BigInt(100 * E8S_PER_ICP),
  };
  const neuron2 = {
    ...mockNeuron,
    neuronId: BigInt(222),
    votingPower: BigInt(300 * E8S_PER_ICP),
  };
  const neuron3 = {
    ...mockNeuron,
    neuronId: BigInt(333),
    votingPower: BigInt(500 * E8S_PER_ICP),
  };
  const neurons: NeuronInfo[] = [neuron1, neuron2, neuron3];
  const ballots = neurons.map(({ neuronId, votingPower }) => ({
    neuronId,
    votingPower: votingPower - BigInt(E8S_PER_ICP),
    vote: Vote.No,
  }));
  const proposalInfo = {
    ...mockProposalInfo,
    ballots,
  };
  const renderComponent = () =>
    render(VotingNeuronSelectList, {
      props: {
        disabled: false,
      },
    });

  beforeEach(() => {
    votingNeuronSelectStore.set(
      neurons.map((neuron) =>
        nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
      )
    );
  });

  it("should render checkbox per neuron", () => {
    const { container, getByText } = renderComponent();

    expect(container.querySelectorAll('[type="checkbox"]')?.length).toBe(3);
    neurons.forEach(({ neuronId }) =>
      expect(
        getByText(neuronId.toString(), { exact: false })
      ).toBeInTheDocument()
    );
  });

  it("should not display total voting power of neurons", async () => {
    const { queryByText } = renderComponent();
    const neuronsVotingPower = formatVotingPower(
      neurons[0].votingPower + neurons[1].votingPower + neurons[2].votingPower
    );
    expect(queryByText(neuronsVotingPower)).toBeNull();
  });

  it("should toggle store state on click", async () => {
    const { container } = renderComponent();
    const checkboxes = container.querySelectorAll('[type="checkbox"]');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(get(votingNeuronSelectStore).selectedIds.sort()).toEqual(
      [neurons[0].neuronId, neurons[2].neuronId].map(String)
    );
  });

  it("should recalculate total voting power after selection", async () => {
    const { getByText } = renderComponent();

    votingNeuronSelectStore.toggleSelection(`${neurons[1].neuronId}`);
    const total = formatVotingPower(
      ballots[0].votingPower + ballots[2].votingPower
    );

    waitFor(() => expect(getByText(total)).toBeInTheDocument());
  });
});
