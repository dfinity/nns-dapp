import VotingNeuronSelect from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelect.svelte";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";

describe("VotingNeuronSelect", () => {
  const neuron1 = {
    ...mockNeuron,
    neuronId: BigInt(111),
    votingPower: 10_000_000_000n,
  };
  const neuron2 = {
    ...mockNeuron,
    neuronId: BigInt(222),
    votingPower: 30_000_000_000n,
  };
  const neuron3 = {
    ...mockNeuron,
    neuronId: BigInt(333),
    votingPower: 50_000_000_000n,
  };
  const neurons: NeuronInfo[] = [neuron1, neuron2, neuron3];
  const ballots = neurons.map(({ neuronId, votingPower }) => ({
    neuronId,
    // Ballots and neurons have different voting power
    votingPower: votingPower - 100_000_000n,
    vote: Vote.No,
  }));
  const proposalInfo = {
    ...mockProposalInfo,
    ballots,
  };

  beforeEach(() => {
    votingNeuronSelectStore.set(
      neurons.map((neuron) =>
        nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
      )
    );
  });

  it("should display total voting power of ballots not of neurons", async () => {
    const { queryByText } = render(VotingNeuronSelect);
    const ballotsVotingPower = formatVotingPower(
      ballots[0].votingPower + ballots[1].votingPower + ballots[2].votingPower
    );
    expect(queryByText(ballotsVotingPower)).toBeInTheDocument();
  });

  it("should not display total voting power of neurons", async () => {
    const { queryByText } = render(VotingNeuronSelect);
    const neuronsVotingPower = formatVotingPower(
      neurons[0].votingPower + neurons[1].votingPower + neurons[2].votingPower
    );
    expect(queryByText(neuronsVotingPower)).toBeNull();
  });

  it("should recalculate total voting power after selection", async () => {
    const { getByText } = render(VotingNeuronSelect);

    votingNeuronSelectStore.toggleSelection(`${neurons[1].neuronId}`);
    const total = formatVotingPower(
      ballots[0].votingPower + ballots[2].votingPower
    );

    waitFor(() => expect(getByText(total)).toBeInTheDocument());
  });

  describe("No selectable neurons", () => {
    beforeEach(() => {
      votingNeuronSelectStore.set([]);
    });

    it("should display no neurons information", () => {
      const { getByTestId } = render(VotingNeuronSelect);

      expect(
        getByTestId("voting-collapsible-toolbar-neurons")?.textContent?.trim()
      ).toEqual(en.proposal_detail__vote.neurons);
      expect(() =>
        getByTestId("voting-collapsible-toolbar-voting-power")
      ).toThrow();
    });
  });

  describe("Has selected neurons", () => {
    const neuronIds = [0, 1, 2].map(BigInt);
    const neurons = neuronIds.map((neuronId) => ({ ...mockNeuron, neuronId }));

    beforeAll(() =>
      votingNeuronSelectStore.set(
        neurons.map((neuron) =>
          nnsNeuronToVotingNeuron({ neuron, proposal: mockProposalInfo })
        )
      )
    );

    it("should display voting power", () => {
      const { getByTestId } = render(VotingNeuronSelect);

      expect(
        getByTestId("voting-collapsible-toolbar-voting-power")
      ).not.toBeNull();
    });

    it("should display selectable neurons for voting power", () => {
      const { getByTestId } = render(VotingNeuronSelect);

      expect(
        getByTestId("voting-collapsible-toolbar-neurons")
          ?.textContent?.trim()
          .includes(`(${neurons.length}/${neurons.length})`)
      ).toBeTruthy();
    });
  });
});
