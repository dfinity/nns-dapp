/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import TransactionList from "../../../../lib/components/accounts/TransactionList.svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockReceivedFromMainAccountTransaction } from "../../../mocks/transaction.mock";

describe("TransactionList", () => {
  it("renders skeleton when no data provided", () => {
    const { getByTestId } = render(TransactionList, {
      props: {
        account: undefined,
        transactions: undefined,
      },
    });

    expect(getByTestId("skeleton-card")).toBeInTheDocument();
  });

  it("should display no-transactions message", () => {
    const { getByText } = render(TransactionList, {
      props: {
        account: mockMainAccount,
        transactions: [],
      },
    });

    expect(
      getByText(en.wallet.no_transactions, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display no-transactions message", () => {
    const { getByText } = render(TransactionList, {
      props: {
        account: mockMainAccount,
        transactions: [],
      },
    });

    expect(
      getByText(en.wallet.no_transactions, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render transactions", () => {
    const { queryAllByTestId } = render(TransactionList, {
      props: {
        account: mockMainAccount,
        transactions: Array.from(Array(13)).fill(
          mockReceivedFromMainAccountTransaction
        ),
      },
    });

    expect(queryAllByTestId("transaction-card").length).toBe(13);
  });
});
