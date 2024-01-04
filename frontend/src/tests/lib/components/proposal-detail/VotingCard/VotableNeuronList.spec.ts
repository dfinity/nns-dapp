import VotableNeuronList from "$lib/components/proposal-detail/VotingCard/VotableNeuronList.svelte";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";

describe("VotableNeuronList", () => {
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
    const { getByTestId } = render(VotableNeuronList, {
      props: {
        voteRegistration: undefined,
      },
    });
    expect(
      getByTestId("voting-collapsible-toolbar-voting-power").textContent
    ).toBe("897.00");
  });

  it("should not display total voting power of neurons", async () => {
    const { getByTestId } = render(VotableNeuronList, {
      props: {
        voteRegistration: undefined,
      },
    });
    const neuronsVotingPower = formatVotingPower(
      neurons[0].votingPower + neurons[1].votingPower + neurons[2].votingPower
    );
    expect(
      getByTestId("voting-collapsible-toolbar-voting-power").textContent
    ).not.toBe(neuronsVotingPower);
  });

  it("should recalculate total voting power after selection", async () => {
    const { getByTestId } = render(VotableNeuronList, {
      props: {
        voteRegistration: undefined,
      },
    });

    votingNeuronSelectStore.toggleSelection(`${neurons[1].neuronId}`);
    // ballots[0].votingPower + ballots[2].votingPower
    await waitFor(() =>
      expect(
        getByTestId("voting-collapsible-toolbar-voting-power").textContent
      ).toBe("598.00")
    );
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
      const { getByTestId } = render(VotableNeuronList, {
        props: {
          voteRegistration: undefined,
        },
      });

      expect(
        getByTestId("voting-collapsible-toolbar-voting-power").textContent
      ).toBe("897.00");
    });

    it("should display selectable neurons for voting power", () => {
      const { getByTestId } = render(VotableNeuronList, {
        props: {
          voteRegistration: undefined,
        },
      });

      expect(
        getByTestId("voting-collapsible-toolbar-neurons")?.textContent
      ).toBe(`Vote with 3/3 Neurons`);
    });
  });
});
