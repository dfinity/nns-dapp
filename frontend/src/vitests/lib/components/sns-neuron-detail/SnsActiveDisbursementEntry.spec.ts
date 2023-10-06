import SnsActiveDisbursementEntry from "$lib/modals/sns/neurons/SnsActiveDisbursementEntry.svelte";
import { mockPrincipalText } from "$tests/mocks/auth.store.mock";
import { ActiveDisbursementEntryPo } from "$tests/page-objects/ActiveDisbursementEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import type { DisburseMaturityInProgress } from "@dfinity/sns/dist/candid/sns_governance";
import { render } from "@testing-library/svelte";
(".svelte");

describe("SnsActiveDisbursementEntry", () => {
  const disbursementTimestamp = 1694000000n;
  const testActiveDisbursement: DisburseMaturityInProgress = {
    timestamp_of_disbursement_seconds: disbursementTimestamp,
    amount_e8s: 123_000_000n,
    account_to_disburse_to: [
      {
        owner: [Principal.from(mockPrincipalText)],
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

  it("should display maturity", async () => {
    const po = renderComponent(testActiveDisbursement);

    expect(await po.getMaturity()).toEqual("1.23");
  });

  it("should display destination", async () => {
    const po = renderComponent(testActiveDisbursement);

    expect(await po.getDestination()).toEqual(mockPrincipalText);
  });

  it("should display timestamp", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));

    const po = renderComponent(testActiveDisbursement);

    expect(await po.getTimestamp()).toEqual("Sep 6, 2023 11:33 AM");
  });
});
