/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import TransactionList from "../../../../lib/components/accounts/TransactionList.svelte";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountContext,
  type SelectedAccountStore,
} from "../../../../lib/types/selected-account.context";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockReceivedFromMainAccountTransaction } from "../../../mocks/transaction.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("TransactionList", () => {
  const renderTransactionList = (account, transactions) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedAccountStore>({
            account,
            transactions,
          }),
        } as SelectedAccountContext,
        Component: TransactionList,
      },
    });

  it("renders skeleton when no data provided", () => {
    const { getByTestId } = renderTransactionList(undefined, undefined);

    expect(getByTestId("skeleton-card")).toBeInTheDocument();
  });

  it("should display no-transactions message", () => {
    const { getByText } = renderTransactionList(mockMainAccount, []);

    expect(
      getByText(en.wallet.no_transactions, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display no-transactions message", () => {
    const { getByText } = renderTransactionList(mockMainAccount, []);

    expect(
      getByText(en.wallet.no_transactions, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render transactions", () => {
    const { queryAllByTestId } = renderTransactionList(
      mockMainAccount,
      Array.from(Array(20)).map((_, index) => ({
        ...mockReceivedFromMainAccountTransaction,
        timestamp: {
          timestamp_nanos: BigInt(index),
        },
      }))
    );

    expect(queryAllByTestId("transaction-card").length).toBe(20);
  });
});
