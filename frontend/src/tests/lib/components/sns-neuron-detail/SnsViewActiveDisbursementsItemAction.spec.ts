/**
 * @jest-environment jsdom
 */

import SnsViewActiveDisbursementsItemAction from "$lib/components/sns-neuron-detail/SnsViewActiveDisbursementsItemAction.svelte";
import {
  mockActiveDisbursement,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { SnsViewActiveDisbursementsItemActionPo } from "$tests/page-objects/SnsViewActiveDisbursementsItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsViewActiveDisbursementsItemAction", () => {
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsViewActiveDisbursementsItemAction, {
      props: {
        neuron,
      },
    });

    return SnsViewActiveDisbursementsItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should not render components when no disbursements available", async () => {
    const po = renderComponent({
      ...mockSnsNeuron,
      disburse_maturity_in_progress: [],
    });

    expect(await po.isPresent()).toBe(false);
  });

  it("should render components when disbursements available", async () => {
    const po = renderComponent({
      ...mockSnsNeuron,
      disburse_maturity_in_progress: [mockActiveDisbursement],
    });

    expect(await po.isPresent()).toBe(true);
  });

  it("should render disbursement amount", async () => {
    const disbursement1 = {
      ...mockActiveDisbursement,
      amount_e8s: 100_000_000n,
    };
    const disbursement2 = {
      ...mockActiveDisbursement,
      amount_e8s: 200_000_000n,
    };
    const po = renderComponent({
      ...mockSnsNeuron,
      disburse_maturity_in_progress: [disbursement1, disbursement2],
    });

    expect(await po.getDisbursementCount()).toBe("3.00");
  });
});
