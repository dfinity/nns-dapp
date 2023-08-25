/**
 * @jest-environment jsdom
 */

import SnsActiveDisbursementEntry from "$lib/modals/sns/neurons/SnsActiveDisbursementEntry.svelte";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { ActiveDisbursementEntryPo } from "$tests/page-objects/ActiveDisbursementEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
import { render } from "@testing-library/svelte";
(".svelte");

describe("SnsActiveDisbursementEntry", () => {
  const testActiveDisbursement: DisburseMaturityInProgress = {
    timestamp_of_disbursement_seconds: 10000n,
    amount_e8s: 122000000n,
    account_to_disburse_to: [
      {
        owner: [mockPrincipal],
        subaccount: [],
      },
    ],
  };
  const renderComponent = (disbursement: DisburseMaturityInProgress) => {
    const { container } = render(SnsActiveDisbursementEntry, {
      props: { disbursement },
    });
    return ActiveDisbursementEntryPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render duration", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));

    const po = renderComponent(testActiveDisbursement);

    expect(await po.getDescriptionText()).toContain("2 hours, 46 minutes");
  });

  it("should render destination", async () => {
    const po = renderComponent(testActiveDisbursement);

    expect(await po.getDescriptionText()).toContain(
      shortenWithMiddleEllipsis(mockPrincipal.toText())
    );
  });

  it("should render destination", async () => {
    const po = renderComponent(testActiveDisbursement);

    expect(await po.getMaturityText()).toContain("1.22");
  });
});
