/**
 * @jest-environment jsdom
 */

import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
import {
  AccountTransactionType,
  type Transaction,
} from "$lib/types/transaction";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockTransactionReceiveDataFromMain,
  mockTransactionSendDataFromMain,
} from "$tests/mocks/transaction.mock";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionCard", () => {
  const renderTransactionCard = ({
    transaction = mockTransactionSendDataFromMain,
    descriptions,
  }: {
    transaction?: Transaction;
    descriptions?: Record<string, string>;
  }) =>
    render(TransactionCard, {
      props: {
        transaction,
        token: ICPToken,
        descriptions,
      },
    });

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard({
      transaction: mockTransactionReceiveDataFromMain,
    });

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders received description", () => {
    const { getByText, getByTestId } = renderTransactionCard({
      transaction: {
        ...mockTransactionReceiveDataFromMain,
        type: AccountTransactionType.Burn,
      },
      descriptions: en.ckbtc_transaction_names as unknown as Record<
        string,
        string
      >,
    });

    const expectedText = replacePlaceholders(en.transaction_names.burn, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();

    expect(getByTestId("transaction-description")?.textContent).toEqual(
      "To: BTC Network"
    );
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard({
      transaction: mockTransactionSendDataFromMain,
    });

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction ICPs with - sign", () => {
    const { getByTestId } = renderTransactionCard({
      transaction: mockTransactionSendDataFromMain,
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({
        value: mockTransactionSendDataFromMain.displayAmount,
        detailed: true,
      })}`
    );
  });

  it("renders transaction ICPs with + sign", () => {
    const { getByTestId } = renderTransactionCard({
      transaction: mockTransactionReceiveDataFromMain,
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({
        value: mockTransactionReceiveDataFromMain.displayAmount,
        detailed: true,
      })}`
    );
  });

  it("displays transaction date and time", () => {
    const { getByTestId } = renderTransactionCard({
      transaction: mockTransactionSendDataFromMain,
    });

    const div = getByTestId("transaction-date");

    const textContent = normalizeWhitespace(div?.textContent);
    expect(textContent).toContain("Mar 14, 2021 12:00 AM");
    expect(textContent).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard({
      transaction: mockTransactionReceiveDataFromMain,
    });
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockTransactionReceiveDataFromMain.from);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard({
      transaction: mockTransactionSendDataFromMain,
    });
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockTransactionSendDataFromMain.to);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
