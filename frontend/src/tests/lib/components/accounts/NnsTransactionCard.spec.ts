/**
 * @jest-environment jsdom
 */

import NnsTransactionCard from "$lib/components/accounts/NnsTransactionCard.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mapNnsTransaction } from "$lib/utils/transactions.utils";
import { ICPToken } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "../../../mocks/transaction.mock";

describe("NnsTransactionCard", () => {
  const renderTransactionCard = (
    account = mockMainAccount,
    transaction = mockReceivedFromMainAccountTransaction
  ) =>
    render(NnsTransactionCard, {
      props: {
        account,
        transaction,
      },
    });

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: ICPToken.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction ICPs with - sign", () => {
    const account = mockMainAccount;
    const transaction = mockSentToSubAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapNnsTransaction({ account, transaction });

    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({ value: displayAmount.toE8s(), detailed: true })}`
    );
  });

  it("renders transaction ICPs with + sign", () => {
    const account = mockSubAccount;
    const transaction = mockReceivedFromMainAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapNnsTransaction({ account, transaction });

    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({ value: displayAmount.toE8s(), detailed: true })}`
    );
  });

  it("displays transaction date and time", () => {
    const { getByTestId } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    const div = getByTestId("transaction-date");

    expect(div?.textContent).toContain("Jan 1, 1970");
    expect(div?.textContent).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockMainAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSubAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
