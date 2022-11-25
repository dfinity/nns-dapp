/**
 * @jest-environment jsdom
 */

import TransactionCard from "$lib/components/accounts/TransactionCard.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { ICPToken } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import {
  mockTransactionReceiveDataFromMain,
  mockTransactionSendDataFromMain,
} from "../../../mocks/transaction.mock";

describe("TransactionCard", () => {
  const renderTransactionCard = (
    transaction = mockTransactionSendDataFromMain
  ) =>
    render(TransactionCard, {
      props: {
        transaction,
        token: ICPToken,
      },
    });

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard(
      mockTransactionReceiveDataFromMain
    );

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard(
      mockTransactionSendDataFromMain
    );

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction ICPs with - sign", () => {
    const { getByTestId } = renderTransactionCard(
      mockTransactionSendDataFromMain
    );

    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({
        value: mockTransactionSendDataFromMain.displayAmount.toE8s(),
        detailed: true,
      })}`
    );
  });

  it("renders transaction ICPs with + sign", () => {
    const { getByTestId } = renderTransactionCard(
      mockTransactionReceiveDataFromMain
    );

    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({
        value: mockTransactionReceiveDataFromMain.displayAmount.toE8s(),
        detailed: true,
      })}`
    );
  });

  it("displays transaction date and time", () => {
    const { getByTestId } = renderTransactionCard(
      mockTransactionSendDataFromMain
    );

    const div = getByTestId("transaction-date");

    expect(div?.textContent).toContain("Mar 14, 2021 12:00 AM");
    expect(div?.textContent).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard(
      mockTransactionReceiveDataFromMain
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockTransactionReceiveDataFromMain.from);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard(
      mockTransactionSendDataFromMain
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockTransactionSendDataFromMain.to);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
