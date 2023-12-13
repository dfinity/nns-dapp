import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
import type { UiTransaction } from "$lib/types/transaction";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { TransactionCardPo } from "$tests/page-objects/TransactionCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { ICPToken, TokenAmount, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionCard", () => {
  const defaultTransaction = {
    domKey: "234-0",
    isIncoming: false,
    isPending: false,
    headline: "Sent",
    otherParty: "some-address",
    tokenAmount: TokenAmount.fromE8s({ amount: 123_000_000n, token: ICPToken }),
    timestamp: new Date("2021-03-14T00:00:00.000Z"),
  } as UiTransaction;

  const renderComponent = (transaction: Partial<UiTransaction>) => {
    const { container } = render(TransactionCard, {
      props: {
        transaction: {
          ...defaultTransaction,
          ...transaction,
        },
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  it("renders received headline", async () => {
    const headline = "Received";
    const po = renderComponent({
      headline,
    });

    expect(await po.getHeadline()).toBe(headline);
  });

  it("renders burn description", async () => {
    const po = renderComponent({
      headline: "Sent",
      otherParty: "BTC Network",
    });

    expect(await po.getHeadline()).toBe("Sent");
    expect(await po.getIdentifier()).toBe("To: BTC Network");
  });

  it("renders ckBTC burn To:", async () => {
    const po = renderComponent({
      isIncoming: false,
      headline: "Sent",
      otherParty: "withdrwala-address",
    });

    expect(await po.getHeadline()).toBe("Sent");
    expect(await po.getIdentifier()).toBe("To: withdrwala-address");
  });

  it("renders sent headline", async () => {
    const headline = "Sent";
    const po = renderComponent({
      headline,
    });

    expect(await po.getHeadline()).toBe(headline);
  });

  it("renders transaction ICPs with - sign", async () => {
    const po = renderComponent({
      isIncoming: false,
      tokenAmount: TokenAmount.fromE8s({
        amount: 123_000_000n,
        token: ICPToken,
      }),
    });

    expect(await po.getAmount()).toBe("-1.23");
  });

  it("renders transaction ICPs with + sign", async () => {
    const po = renderComponent({
      isIncoming: true,
      tokenAmount: TokenAmount.fromE8s({
        amount: 345_000_000n,
        token: ICPToken,
      }),
    });

    expect(await po.getAmount()).toBe("+3.45");
  });

  it("displays transaction date and time", async () => {
    const po = renderComponent({
      timestamp: new Date("2021-03-14T00:00:00.000Z"),
    });

    expect(normalizeWhitespace(await po.getDate())).toBe(
      "Mar 14, 2021 12:00 AM"
    );
    expect(await po.hasPendingIcon()).toBe(false);
  });

  it("displays pending transaction", async () => {
    const po = renderComponent({
      isPending: true,
      timestamp: null,
    });

    expect(normalizeWhitespace(await po.getDate())).toBe("Pending...");
    expect(await po.hasPendingIcon()).toBe(true);
  });

  it("displays reimbursement transaction", async () => {
    const po = renderComponent({
      isReimbursement: true,
    });

    expect(await po.hasReimbursementIcon()).toBe(true);
  });

  it("displays identifier for received", async () => {
    const po = renderComponent({
      isIncoming: true,
      otherParty: "from-address",
    });

    expect(await po.getIdentifier()).toBe("From: from-address");
  });

  it("displays identifier for sent", async () => {
    const po = renderComponent({
      isIncoming: false,
      otherParty: "to-address",
    });

    expect(await po.getIdentifier()).toBe("To: to-address");
  });

  it("supports differnt decimals than 8", async () => {
    const po = renderComponent({
      tokenAmount: TokenAmountV2.fromUlps({
        amount: 1230000000000000000n,
        token: mockCkETHToken,
      }),
      isIncoming: true,
    });

    expect(await po.getAmount()).toBe("+1.23");
  });
});
