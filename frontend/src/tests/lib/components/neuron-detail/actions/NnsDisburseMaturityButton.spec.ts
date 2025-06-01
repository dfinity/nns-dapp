import NnsDisburseMaturityButton from "$lib/components/neuron-detail/actions/NnsDisburseMaturityButton.svelte";
import {
  MATURITY_MODULATION_VARIANCE_PERCENTAGE,
  MINIMUM_DISBURSEMENT,
} from "$lib/constants/neurons.constants";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsDisburseMaturityButton", () => {
  const ENOUGH_MATURITY = BigInt(
    Math.round(
      Number(MINIMUM_DISBURSEMENT) / MATURITY_MODULATION_VARIANCE_PERCENTAGE
    )
  );
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsDisburseMaturityButton, {
      props: {
        neuron,
      },
    });
    return DisburseMaturityButtonPo.under(new JestPageObjectElement(container));
  };

  it("is enabled when there is enough maturity", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: ENOUGH_MATURITY,
      },
    });

    expect(await po.isPresent()).toBe(true);
    expect(await po.isDisabled()).toBe(false);
  });

  it("is disabled when there is not enough maturity", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: ENOUGH_MATURITY - 1n,
      },
    });

    expect(await po.isPresent()).toBe(true);
    expect(await po.isDisabled()).toBe(true);
    expect(await po.getTooltipText()).toBe(
      "You need at least the equivalent of 1.0526 ICP (1 / 95%) to disburse maturity."
    );
  });
});
