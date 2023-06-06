import type { Account } from "$lib/types/account";
import type { PostMessageDataRequestAccounts } from "$lib/types/post-message.accounts";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";

export type AccountsObserverData = Pick<
  PostMessageDataRequestAccounts,
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
