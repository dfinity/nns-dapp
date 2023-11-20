import IcrcTransactionCard from "$lib/components/accounts/IcrcTransactionCard.svelte";
import type { UiTransaction } from "$lib/types/transaction";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("IcrcTransactionCard", () => {
  const renderComponent = (transaction: UiTransaction | undefined) => {
    const { container } = render(IcrcTransactionCard, {
      props: {
        transaction,
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  const defaultTransaction = {
    domKey: "123-0",
    isIncoming: false,
    icon: "outgoing",
    headline: "Sent",
    otherParty: "some-address",
    tokenAmount: TokenAmount.fromE8s({ amount: 123_000_000n, token: ICPToken }),
    timestamp: new Date("2021-03-14T00:00:00.000Z"),
  } as UiTransaction;

  it("renders nothing for undefined", async () => {
    const po = renderComponent(undefined);
    expect(await po.isPresent()).toBe(false);
  });

  it("renders sent headline", async () => {
    const headline = "Sent";
    const po = renderComponent({
      ...defaultTransaction,
      headline,
    });

    expect(await po.getHeadline()).toBe(headline);
  });

  it("renders received headline", async () => {
    const headline = "Received";
    const po = renderComponent({
      ...defaultTransaction,
      headline,
    });

    expect(await po.getHeadline()).toBe(headline);
  });
});
