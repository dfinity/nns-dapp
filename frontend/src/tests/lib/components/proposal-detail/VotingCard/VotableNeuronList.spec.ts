import VotableNeuronList from "$lib/components/proposal-detail/VotingCard/VotableNeuronList.svelte";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotableNeuronListPo } from "$tests/page-objects/VotableNeuronList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("VotableNeuronList", () => {
  const neuron1 = {
    ...mockNeuron,
    neuronId: 111n,
    votingPower: 10_000_000_123n,
  };
  const neuron2 = {
    ...mockNeuron,
    neuronId: 222n,
    votingPower: 30_000_000_000n,
  };
  const neuron3 = {
    ...mockNeuron,
    neuronId: 333n,
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

  const renderComponent = () => {
    const { container } = render(VotableNeuronList, {
      props: {
        voteRegistration: undefined,
      },
    });
    return VotableNeuronListPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    votingNeuronSelectStore.set(
      neurons.map((neuron) =>
        nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
      )
    );
  });

  it("should display total voting power of ballots not of neurons", async () => {
    const po = renderComponent();
    expect(await po.getDisplayedTotalSelectedVotingPower()).toBe("897.00");
  });

  it("should have a tooltip with exact voting power", async () => {
    const po = renderComponent();
    expect(await po.getTooltipPo().getTooltipText()).toBe("897.00000123");
  });

  it("should not display total voting power of neurons", async () => {
    const neuronsVotingPower = formatVotingPower(
      neurons[0].votingPower + neurons[1].votingPower + neurons[2].votingPower
    );
    const po = renderComponent();
    expect(await po.getDisplayedTotalSelectedVotingPower()).not.toBe(
      neuronsVotingPower
    );
  });

  it("should recalculate total voting power after selection", async () => {
    const po = renderComponent();

    await runResolvedPromises();
    expect(await po.getDisplayedTotalSelectedVotingPower()).toBe("897.00");

    votingNeuronSelectStore.toggleSelection(`${neurons[1].neuronId}`);

    await runResolvedPromises();
    expect(await po.getDisplayedTotalSelectedVotingPower()).toBe("598.00");
  });

  describe("Has selected neurons", () => {
    it("should display voting power", async () => {
      const po = renderComponent();
      expect(await po.getDisplayedTotalSelectedVotingPower()).toBe("897.00");
    });

    it("should display selectable neurons for voting power", async () => {
      const po = renderComponent();
      expect(await po.getTitle()).toBe("Vote with 3/3 Neurons");
    });

    it("should display selectable neurons in singular form", async () => {
      votingNeuronSelectStore.set([
        nnsNeuronToVotingNeuron({ neuron: neuron1, proposal: proposalInfo }),
      ]);

      const po = renderComponent();
      expect(await po.getTitle()).toBe(`Vote with 1/1 Neuron`);
    });
  });
});
