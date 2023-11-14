import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
import {
  AccountTransactionType,
  type Transaction,
} from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import {
  mockTransactionReceiveDataFromMain,
  mockTransactionSendDataFromMain,
} from "$tests/mocks/transaction.mock";
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
    transaction?: Transaction;
    descriptions?: Record<string, string>;
  }) => {
    const { container } = render(TransactionCard, {
      props: {
        transaction,
        token: ICPToken,
        descriptions,
      },
    });
    return TransactionCardPo.under(new JestPageObjectElement(container));
  };

  it("renders received headline", async () => {
    const po = renderComponent({
      transaction: mockTransactionReceiveDataFromMain,
    });

    expect(await po.getHeadline()).toBe("Received");
  });

  it("renders ckBTC approve description", async () => {
    const po = renderComponent({
      transaction: {
        ...mockTransactionReceiveDataFromMain,
        type: AccountTransactionType.Approve,
        from: undefined,
        to: undefined,
      },
      descriptions: en.ckbtc_transaction_names as unknown as Record<
        string,
        string
      >,
    });

    expect(await po.getHeadline()).toBe("Approve transfer");
    // Approve transfer transactions don't have a description but we render a
    // zero-width space to keep the layout consistent.
    expect(await po.getDescription()).toBe("​");
  });

  it("renders ckBTC burn To:", async () => {
    const po = renderComponent({
      transaction: {
        ...mockTransactionSendDataFromMain,
        type: AccountTransactionType.Burn,
      },
      descriptions: en.ckbtc_transaction_names as unknown as Record<
        string,
        string
      >,
    });

    expect(await po.getHeadline()).toBe("Sent");
    expect(await po.getIdentifier()).toBe(
      `To: ${mockTransactionSendDataFromMain.to}`
    );
  });

  it("renders sent headline", async () => {
    const po = renderComponent({
      transaction: mockTransactionSendDataFromMain,
    });

    expect(await po.getHeadline()).toBe("Sent");
  });

  it("renders transaction ICPs with - sign", async () => {
    const po = renderComponent({
      transaction: {
        ...mockTransactionSendDataFromMain,
        displayAmount: 123_000_000n,
      },
    });

    expect(await po.getAmount()).toBe("-1.23");
  });

  it("renders transaction ICPs with + sign", async () => {
    const po = renderComponent({
      transaction: {
        ...mockTransactionReceiveDataFromMain,
        displayAmount: 345_000_000n,
      },
    });

    expect(await po.getAmount()).toBe("+3.45");
  });

  it("displays transaction date and time", async () => {
    const po = renderComponent({
      transaction: mockTransactionSendDataFromMain,
    });

    expect(normalizeWhitespace(await po.getDate())).toBe(
      "Mar 14, 2021 12:00 AM"
    );
  });

  it("displays identifier for received", async () => {
    const po = renderComponent({
      transaction: mockTransactionReceiveDataFromMain,
    });

    expect(await po.getIdentifier()).toBe(
      `Source: ${mockTransactionReceiveDataFromMain.from}`
    );
  });

  it("displays identifier for sent", async () => {
    const po = renderComponent({
      transaction: mockTransactionSendDataFromMain,
    });

    expect(await po.getIdentifier()).toBe(
      `To: ${mockTransactionSendDataFromMain.to}`
    );
  });
});
