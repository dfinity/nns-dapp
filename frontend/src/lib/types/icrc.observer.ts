import type { Account } from "$lib/types/account";
import type { PostMessageDataRequestBalances } from "$lib/types/post-message.balances";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";

export type AccountsObserverData = Pick<
  PostMessageDataRequestBalances,
  "ledgerCanisterId"
> & {
  account: Account;
};

export type TransactionsObserverData = Pick<
  PostMessageDataRequestTransactions,
  "indexCanisterId"
> & {
  account: Account;
};
