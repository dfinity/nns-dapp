import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotingNeuronSelectListPo } from "$tests/page-objects/VotingNeuronSelectList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("VotingNeuronSelectList", () => {
  const neuron1 = {
    ...mockNeuron,
    neuronId: 111n,
    votingPower: 10_000_000_000n,
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
  const renderComponent = () =>
    render(VotingNeuronSelectList, {
      props: {
        disabled: false,
      },
    });

  const renderPo = () => {
    const { container } = renderComponent();
    return VotingNeuronSelectListPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    votingNeuronSelectStore.set(
      neurons.map((neuron) =>
        nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
      )
    );
  });

  it("should render checkbox per neuron", async () => {
    const po = renderPo();
    const items = await po.getVotingNeuronListItemPos();
    expect(items).toHaveLength(3);
    expect(await items[0].getCheckboxPo().isPresent()).toBe(true);
    expect(await items[1].getCheckboxPo().isPresent()).toBe(true);
    expect(await items[2].getCheckboxPo().isPresent()).toBe(true);
  });

  it("should toggle store state on click", async () => {
    const po = renderPo();
    const items = await po.getVotingNeuronListItemPos();
    expect(items).toHaveLength(3);

    expect(get(votingNeuronSelectStore).selectedIds.sort()).toEqual(
      [neurons[0].neuronId, neurons[1].neuronId, neurons[2].neuronId].map(
        String
      )
    );

    await items[0].getCheckboxPo().click();
    await items[0].getCheckboxPo().click();
    await items[1].getCheckboxPo().click();

    expect(get(votingNeuronSelectStore).selectedIds.sort()).toEqual(
      [neurons[0].neuronId, neurons[2].neuronId].map(String)
    );
  });
});
