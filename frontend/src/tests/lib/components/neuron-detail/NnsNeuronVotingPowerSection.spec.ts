import NnsNeuronVotingPowerSection from "$lib/components/neuron-detail/NnsNeuronVotingPowerSection.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronVotingPowerSectionPo } from "$tests/page-objects/NnsNeuronVotingPowerSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsStakeItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronVotingPowerSection,
      },
    });

    return NnsNeuronVotingPowerSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render voting power", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      votingPower: 614000000n,
    };
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("6.14");
  });

  it("should render NnsStakeItemAction", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
  });

  it("should render NnsNeuronStateItemAction", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasNeuronStateItemAction()).toBe(true);
  });
});
