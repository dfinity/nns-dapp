import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
import type { Transaction, UiTransaction } from "$lib/types/transaction";
import { mockTransactionSendDataFromMain } from "$tests/mocks/transaction.mock";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionCard", () => {
  const renderComponent = ({
    transaction = mockTransactionSendDataFromMain,
    descriptions,
  }: {
    transaction?: Transaction | UiTransaction;
    descriptions?: Record<string, string>;
  }) => {
    const { container } = render(TransactionCard, {
      props: {
        transaction,
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  const defaultTransaction = {
    isIncoming: false,
    icon: "outgoing",
    headline: "Sent",
    otherParty: "some-address",
    amount: 123_000_000n,
    token: ICPToken,
    timestamp: new Date("2021-03-14T00:00:00.000Z"),
  } as UiTransaction;

  it("renders received headline", async () => {
    const headline = "Received";
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        headline,
      },
    });

    expect(await po.getHeadline()).toBe(headline);
  });

  it("renders burn description", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        headline: "Sent",
        fallbackDescription: "To: BTC Network",
        otherParty: undefined,
      },
    });

    expect(await po.getHeadline()).toBe("Sent");
    expect(await po.getDescription()).toBe("To: BTC Network");
    expect(await po.getIdentifier()).toBe(null);
  });

  it("renders ckBTC burn To:", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        isIncoming: false,
        headline: "Sent",
        otherParty: "withdrwala-address",
      },
    });

    expect(await po.getHeadline()).toBe("Sent");
    expect(await po.getIdentifier()).toBe("To: withdrwala-address");
    expect(await po.getDescription()).toBe(null);
  });

  it("renders sent headline", async () => {
    const headline = "Sent";
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        headline,
      },
    });

    expect(await po.getHeadline()).toBe(headline);
  });

  it("renders transaction ICPs with - sign", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        isIncoming: false,
        amount: 123_000_000n,
      },
    });

    expect(await po.getAmount()).toBe("-1.23");
  });

  it("renders transaction ICPs with + sign", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        isIncoming: true,
        amount: 345_000_000n,
      },
    });

    expect(await po.getAmount()).toBe("+3.45");
  });

  it("displays transaction date and time", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        timestamp: new Date("2021-03-14T00:00:00.000Z"),
      },
    });

    expect(normalizeWhitespace(await po.getDate())).toBe(
      "Mar 14, 2021 12:00 AM"
    );
  });

  it("displays identifier for received", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        isIncoming: true,
        otherParty: "from-address",
      },
    });

    expect(await po.getIdentifier()).toBe("From: from-address");
  });

  it("displays identifier for sent", async () => {
    const po = renderComponent({
      transaction: {
        ...defaultTransaction,
        isIncoming: false,
        otherParty: "to-address",
      },
    });

    expect(await po.getIdentifier()).toBe("To: to-address");
  });
});
