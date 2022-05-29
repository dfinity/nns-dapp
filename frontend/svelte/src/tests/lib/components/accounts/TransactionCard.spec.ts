/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import TransactionCard from "../../../../lib/components/accounts/TransactionCard.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mapTransaction } from "../../../../lib/utils/transactions.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "../../../mocks/transaction.mock";

describe("Address", () => {
  const renderTransactionCard = (
    account = mockMainAccount,
    transaction = mockReceivedFromMainAccountTransaction
  ) =>
    render(TransactionCard, {
      props: {
        account,
        transaction,
      },
    });

  it("renders received headline", () => {
    const { container } = renderTransactionCard(
      mockSubAccount,
      mockReceivedFromMainAccountTransaction
    );

    expect(container.querySelector(".title")?.textContent).toBe(
      en.transaction_names.receive
    );
  });

  it("renders sent headline", () => {
    const { container } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    expect(container.querySelector(".title")?.textContent).toBe(
      en.transaction_names.send
    );
  });

  it("renders transaction ICPs with - sign", () => {
    const account = mockMainAccount;
    const transaction = mockSentToSubAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapTransaction({ account, transaction });

    expect(getByTestId("icp-value")?.textContent).toBe(
      `-${formatICP(displayAmount.toE8s())}`
    );
  });

  it("renders transaction ICPs with + sign", () => {
    const account = mockSubAccount;
    const transaction = mockReceivedFromMainAccountTransaction;
    const { getByTestId } = renderTransactionCard(account, transaction);
    const { displayAmount } = mapTransaction({ account, transaction });

    expect(getByTestId("icp-value")?.textContent).toBe(
      `+${formatICP(displayAmount.toE8s())}`
    );
  });

  it("displays transaction date and time", () => {
    const { container } = renderTransactionCard(
      mockMainAccount,
      mockSentToSubAccountTransaction
    );

    expect(container.querySelector("p")?.textContent).toContain(
      "January 1, 1970"
    );
    expect(container.querySelector("p")?.textContent).toContain("12:00 AM");
  });

  it("displays identifier for reseived", () => {
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
