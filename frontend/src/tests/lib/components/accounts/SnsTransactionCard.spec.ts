/**
 * @jest-environment jsdom
 */

import SnsTransactionCard from "$lib/components/accounts/SnsTransactionCard.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { mapSnsTransaction } from "$lib/utils/sns-transactions.utils";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../../mocks/sns-accounts.mock";
import { createSnstransactionWithId } from "../../../mocks/sns-transactions.mock";

describe("SnsTransactionCard", () => {
  const renderTransactionCard = (account, transactionWithId) =>
    render(SnsTransactionCard, {
      props: {
        account,
        transactionWithId,
        toSelfTransaction: false,
      },
    });

  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createSnstransactionWithId(to, from);

  it("renders received headline", () => {
    const { getByText } = renderTransactionCard(
      mockSnsSubAccount,
      transactionFromMainToSubaccount
    );

    const expectedText = replacePlaceholders(en.transaction_names.receive, {
      $tokenSymbol: mockSnsSubAccount.balance.token.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders sent headline", () => {
    const { getByText } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );

    const expectedText = replacePlaceholders(en.transaction_names.send, {
      $tokenSymbol: mockSnsSubAccount.balance.token.symbol,
    });
    expect(getByText(expectedText)).toBeInTheDocument();
  });

  it("renders transaction Token symbol with - sign", () => {
    const account = mockSnsMainAccount;
    const transaction = transactionFromMainToSubaccount;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapSnsTransaction({
      account,
      toSelfTransaction: false,
      transaction,
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `-${formatToken({
        value: displayAmount.toE8s() + transactoinFee.toE8s(),
        detailed: true,
      })}`
    );
  });

  it("renders transaction Tokens with + sign", () => {
    const account = mockSnsSubAccount;
    const transaction = transactionFromMainToSubaccount;
    const { getByTestId } = renderTransactionCard(
      mockSnsSubAccount,
      transactionFromMainToSubaccount
    );
    const { displayAmount } = mapSnsTransaction({
      account,
      transaction,
      toSelfTransaction: false,
    });

    expect(getByTestId("token-value")?.textContent).toBe(
      `+${formatToken({ value: displayAmount.toE8s(), detailed: true })}`
    );
  });

  it("displays transaction date and time", () => {
    const { container } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );

    expect(container.querySelector("p")?.textContent).toContain(
      "January 1, 1970"
    );
    expect(container.querySelector("p")?.textContent).toContain("12:00 AM");
  });

  it("displays identifier for received", () => {
    const { getByTestId } = renderTransactionCard(
      mockSnsSubAccount,
      transactionFromMainToSubaccount
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSnsMainAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_from);
  });

  it("displays identifier for sent", () => {
    const { getByTestId } = renderTransactionCard(
      mockSnsMainAccount,
      transactionFromMainToSubaccount
    );
    const identifier = getByTestId("identifier")?.textContent;

    expect(identifier).toContain(mockSnsSubAccount.identifier);
    expect(identifier).toContain(en.wallet.direction_to);
  });
});
