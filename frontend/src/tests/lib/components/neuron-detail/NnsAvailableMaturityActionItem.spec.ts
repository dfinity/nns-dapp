import NnsAvailableMaturityActionItem from "$lib/components/neuron-detail/NnsAvailableMaturityActionItem.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsAvailableMaturityActionItemPo } from "$tests/page-objects/NnsAvailableMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsAvailableMaturityActionItem", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAvailableMaturityActionItem,
      },
    });

    return NnsAvailableMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render available maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: 314000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render buttons", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });
});
