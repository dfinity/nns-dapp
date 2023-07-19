/**
 * @jest-environment jsdom
 */

import SnsAvailableMaturityActionItem from "$lib/components/sns-neuron-detail/SnsAvailableMaturityActionItem.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsAvailableMaturityActionItemPo } from "$tests/page-objects/SnsAvailableMaturityActionItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./SnsNeuronContextTest.svelte";

describe("SnsAvailableMaturityActionItem", () => {
  const mockNeuron = createMockSnsNeuron({
    id: [1],
    maturity: 314000000n,
  });
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        passPropNeuron: true,
        rootCanisterId: mockCanisterId,
        testComponent: SnsAvailableMaturityActionItem,
      },
    });

    return SnsAvailableMaturityActionItemPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render available maturity", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render stake maturity button", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.hasStakeButton()).toBe(true);
  });
});
