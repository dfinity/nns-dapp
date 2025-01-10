import SnsStakedMaturityItemAction from "$lib/components/sns-neuron-detail/SnsStakedMaturityItemAction.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsStakedMaturityItemActionPo } from "$tests/page-objects/SnsStakedMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "$tests/lib/components/sns-neuron-detail/SnsNeuronContextTest.svelte";

describe("SnsStakedMaturityItemAction", () => {
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        rootCanisterId: mockCanisterId,
        passPropNeuron: true,
        testComponent: SnsStakedMaturityItemAction,
      },
    });

    return SnsStakedMaturityItemActionPo.under(
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

  it("should have an appropriate tooltip ID", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
    });
    const po = renderComponent(neuron);

    expect(await po.getTooltipIconPo().getTooltipPo().getTooltipId()).toBe(
      "sns-staked-maturity-tooltip"
    );
  });
});
