import type { Account } from "$lib/types/account";
import type { PostMessageDataRequestAccounts } from "$lib/types/post-message.accounts";

export type AccountsObserverData = Pick<
  PostMessageDataRequestAccounts,
  "ledgerCanisterId"
> & {
  account: Account;
};
