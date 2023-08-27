/**
 * @jest-environment jsdom
 */

import SnsViewActiveDisbursementsItemAction from "$lib/components/sns-neuron-detail/SnsViewActiveDisbursementsItemAction.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsViewActiveDisbursementsItemActionPo } from "$tests/page-objects/SnsViewActiveDisbursementsItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
import { render } from "@testing-library/svelte";

const testActiveDisbursement: DisburseMaturityInProgress = {
  timestamp_of_disbursement_seconds: 10000n,
  amount_e8s: 1000000n,
  account_to_disburse_to: [
    {
      owner: [mockPrincipal],
      subaccount: [],
    },
  ],
};

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

  it("should render disbursement count", async () => {
    const po = renderComponent({
      ...mockSnsNeuron,
      disburse_maturity_in_progress: [
        testActiveDisbursement,
        testActiveDisbursement,
      ],
    });

    expect(await po.getDisbursementCount()).toBe(2);
  });
});
