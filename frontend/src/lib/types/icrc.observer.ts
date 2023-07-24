import type { Account } from "$lib/types/account";
import type { PostMessageDataRequestBalances } from "$lib/types/post-message.balances";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";

export type BalancesObserverData = Pick<
  PostMessageDataRequestBalances,
  "ledgerCanisterId"
> & {
  accounts: Account[];
};

export type TransactionsObserverData = Pick<
  PostMessageDataRequestTransactions,
  "indexCanisterId"
> & {
  account: Account;
};
