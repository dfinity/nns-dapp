import VotedNeuronList from "$lib/components/proposal-detail/VotingCard/VotedNeuronList.svelte";
import type { CompactNeuronInfo } from "$lib/utils/neuron.utils";
import { VotedNeuronListPo } from "$tests/page-objects/VotedNeuronList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Vote } from "@dfinity/nns";

describe("VotedNeuronList", () => {
  const neuron1 = {
    idString: "111",
    votingPower: 10_000_000_123n,
    vote: Vote.No,
  };
  const neuron2 = {
    idString: "222",
    votingPower: 20_000_000_000n,
    vote: Vote.Yes,
  };

  const renderComponent = (neurons: CompactNeuronInfo[]) => {
    const { container } = render(VotedNeuronList, {
      neuronsVotedForProposal: neurons,
    });
    return VotedNeuronListPo.under(new JestPageObjectElement(container));
  };

  it("should display number of voted neuron in headline", async () => {
    const po1 = renderComponent([neuron1]);
    expect(await po1.getHeadline()).toBe("1 neuron voted");
    const po2 = renderComponent([neuron1, neuron2]);
    expect(await po2.getHeadline()).toBe("2 neurons voted");
  });

  it("should display total voting power of neurons", async () => {
    const po = renderComponent([neuron1, neuron2]);
    expect(await po.getDisplayedTotalVotingPower()).toBe("300.00");
  });

  it("should have tooltip with exact total voting power of neurons", async () => {
    const po = renderComponent([neuron1, neuron2]);
    expect(await po.getExactTotalVotingPower()).toBe("300.00000123");
  });

  it("should display neuron ID of individual neurons", async () => {
    const po = renderComponent([neuron1, neuron2]);
    expect(await po.getMyVotesPo().getNeuronIds()).toEqual(["111", "222"]);
  });

  it("should display individual voting power of neurons", async () => {
    const po = renderComponent([neuron1, neuron2]);
    expect(await po.getMyVotesPo().getDisplayedVotingPowers()).toEqual([
      "100.00",
      "200.00",
    ]);
  });

  it("should have tooltips with exact voting power of neurons", async () => {
    const po = renderComponent([neuron1, neuron2]);
    expect(await po.getMyVotesPo().getExactVotingPowers()).toEqual([
      "100.00000123",
      "200.00000000",
    ]);
  });
});
