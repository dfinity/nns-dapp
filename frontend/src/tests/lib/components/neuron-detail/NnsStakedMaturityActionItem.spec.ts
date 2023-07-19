import NnsStakedMaturityActionItem from "$lib/components/neuron-detail/NnsStakedMaturityActionItem.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsStakedMaturityActionItemPo } from "$tests/page-objects/NnsStakedMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsStakedMaturityActionItem", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsStakedMaturityActionItem,
      },
    });

    return NnsStakedMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render staked maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        stakedMaturityE8sEquivalent: 314000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getStakedMaturity()).toBe("3.14");
  });
});
