/**
 * @jest-environment jsdom
 */

import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { VestingTooltipWrapperPo } from "$tests/page-objects/VestingTooltipWrapper.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("VestingTooltipWrapper", () => {
  const nonVestingNeuron = createMockSnsNeuron({
    id: [1],
    vesting: false,
  });
  const vestingNeuron = createMockSnsNeuron({
    id: [1],
    vesting: true,
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(VestingTooltipWrapper, {
      props: {
        neuron,
      },
    });

    return VestingTooltipWrapperPo.under(new JestPageObjectElement(container));
  };

  it("should not render tooltip if neuron is not vesting", async () => {
    const po = renderComponent(nonVestingNeuron);

    expect(await po.getTooltipPo().isPresent()).toBe(false);
  });

  it("should render tooltip if neuron is vesting", async () => {
    const po = renderComponent(vestingNeuron);

    expect(await po.getTooltipPo().isPresent()).toBe(true);
    expect(await po.getTooltipPo().getText()).toBe(
      "This function is not available during your vesting period. Vesting will last another 29 days, 10 hours"
    );
  });
});
