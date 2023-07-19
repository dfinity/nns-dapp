import SnsStakedMaturityActionItem from "$lib/components/sns-neuron-detail/SnsStakedMaturityActionItem.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsStakedMaturityActionItemPo } from "$tests/page-objects/SnsStakedMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./SnsNeuronContextTest.svelte";

describe("SnsStakedMaturityActionItem", () => {
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        rootCanisterId: mockCanisterId,
        passPropNeuron: true,
        testComponent: SnsStakedMaturityActionItem,
      },
    });

    return SnsStakedMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render staked maturity", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      stakedMaturity: 314000000n,
    });
    const po = renderComponent(neuron);

    expect(await po.getStakedMaturity()).toBe("3.14");
  });
});
