/**
 * @jest-environment jsdom
 */

import SnsStakedMaturityItemAction from "$lib/components/sns-neuron-detail/SnsStakedMaturityItemAction.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsStakedMaturityItemActionPo } from "$tests/page-objects/SnsStakedMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./SnsNeuronContextTest.svelte";

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

    return SnsStakedMaturityItemActionPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  it("should render staked maturity", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      stakedMaturity: 314000000n,
    });
    const po = renderComponent(neuron);

    expect(await po.getTitle()).toBe("3.14");
  });
});
