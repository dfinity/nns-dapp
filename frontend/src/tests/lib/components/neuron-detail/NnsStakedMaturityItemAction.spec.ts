/**
 * @jest-environment jsdom
 */

import NnsStakedMaturityItemAction from "$lib/components/neuron-detail/NnsStakedMaturityItemAction.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsStakedMaturityItemActionPo } from "$tests/page-objects/NnsStakedMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsStakedMaturityItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsStakedMaturityItemAction,
      },
    });

    return NnsStakedMaturityItemActionPo.under({
      element: new JestPageObjectElement(container),
    });
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

    expect(await po.getTitle()).toBe("3.14");
  });
});
