/**
 * @jest-environment jsdom
 */

import { Vote, type NeuronInfo } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import VotingNeuronSelect from "../../../../../lib/components/proposal-detail/VotingCard/VotingNeuronSelect.svelte";
import { E8S_PER_ICP } from "../../../../../lib/constants/icp.constants";
import { votingNeuronSelectStore } from "../../../../../lib/stores/proposals.store";
import { formatVotingPower } from "../../../../../lib/utils/neuron.utils";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("VotingNeuronSelect", () => {
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

  beforeEach(() => {
    votingNeuronSelectStore.set(neurons);
  });

  it("should render checkbox per neuron", () => {
    const { container, getByText } = render(VotingNeuronSelect, {
      proposalInfo,
    });
    expect(container.querySelectorAll('[type="checkbox"]')?.length).toBe(3);
    neurons.forEach(({ neuronId }) =>
      expect(
        getByText(neuronId.toString(), { exact: false })
      ).toBeInTheDocument()
    );
  });

  it("should display total voting power of ballots not of neurons", async () => {
    const { queryByText } = render(VotingNeuronSelect, { proposalInfo });
    const neuronsVotingPower = formatVotingPower(
      neurons[0].votingPower + neurons[1].votingPower + neurons[2].votingPower
    );
    const ballotsVotingPower = formatVotingPower(
      ballots[0].votingPower + ballots[1].votingPower + ballots[2].votingPower
    );
    expect(queryByText(neuronsVotingPower)).toBeNull();
    expect(queryByText(ballotsVotingPower)).toBeInTheDocument();
  });

  it("should toggle store state on click", async () => {
    const { container } = render(VotingNeuronSelect, { proposalInfo });
    const checkboxes = container.querySelectorAll('[type="checkbox"]');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(get(votingNeuronSelectStore).selectedIds.sort()).toEqual([
      neurons[0].neuronId,
      neurons[2].neuronId,
    ]);
  });

  it("should recalculate total voting power after selection", async () => {
    const { getByText } = render(VotingNeuronSelect, { proposalInfo });

    votingNeuronSelectStore.toggleSelection(neurons[1].neuronId);
    const total = formatVotingPower(
      ballots[0].votingPower + ballots[2].votingPower
    );

    waitFor(() => expect(getByText(total)).toBeInTheDocument());
  });
});
