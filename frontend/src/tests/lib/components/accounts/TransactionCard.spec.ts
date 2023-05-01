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
import { ICPToken } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("TransactionCard", () => {
  const renderTransactionCard = ({
    transaction = mockTransactionSendDataFromMain,
    description,
  }: {
    transaction?: Transaction;
    description?:
      | ((transaction: Transaction) => string | undefined)
      | undefined;
  }) =>
    render(TransactionCard, {
      props: {
        transaction,
        token: ICPToken,
        description,
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
    const spy = jest.fn();
    const transaction = {
      ...mockTransactionReceiveDataFromMain,
      type: AccountTransactionType.Burn,
    };

    const { getByText } = renderTransactionCard({
      transaction,
      description: spy,
    });

    const expectedText = replacePlaceholders(en.transaction_names.burn, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(transaction);
  });

  it("should not render identifier if a description is provided", () => {
    const transaction = {
      ...mockTransactionReceiveDataFromMain,
      type: AccountTransactionType.Burn,
    };

    const { getByTestId } = renderTransactionCard({
      transaction,
      description: () => "test",
    });

    expect(() => getByTestId("identifier")).toThrow();
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
        value: mockTransactionSendDataFromMain.displayAmount.toE8s(),
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
        value: mockTransactionReceiveDataFromMain.displayAmount.toE8s(),
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
