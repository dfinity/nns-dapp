import TransactionList from "$lib/components/accounts/TransactionList.svelte";
import {
  WALLET_CONTEXT_KEY,
  type WalletContext,
  type WalletStore,
} from "$lib/types/wallet.context";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockReceivedFromMainAccountTransaction } from "$tests/mocks/transaction.mock";
import { TransactionListPo } from "$tests/page-objects/TransactionList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";

describe("TransactionList", () => {
  const renderTransactionList = (account, transactions) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: WALLET_CONTEXT_KEY,
        contextValue: {
          store: writable<WalletStore>({
            account,
            neurons: [],
          }),
        } as WalletContext,
        props: { transactions },
        Component: TransactionList,
      },
    });

  const renderComponent = ({ account, transactions }) => {
    const { container } = renderTransactionList(account, transactions);
    return TransactionListPo.under(new JestPageObjectElement(container));
  };

  it("renders skeleton when no data provided", async () => {
    const po = renderComponent({ account: undefined, transactions: undefined });

    expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
  });

  it("should display no-transactions message", async () => {
    const po = renderComponent({ account: mockMainAccount, transactions: [] });

    expect(await po.hasNoTransactions()).toBe(true);
  });

  it("should render transactions", async () => {
    const po = renderComponent({
      account: mockMainAccount,
      transactions: Array.from(Array(20)).map((_, index) => ({
        ...mockReceivedFromMainAccountTransaction,
        timestamp: {
          timestamp_nanos: BigInt(index),
        },
      })),
    });

    expect(await po.getTransactionCardPos()).toHaveLength(20);
    expect(await po.hasNoTransactions()).toBe(false);
  });
});
