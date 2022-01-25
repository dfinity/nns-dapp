import type { Subscriber } from "svelte/store";
import type { AccountsStore } from "../../lib/stores/accounts.store";
import type { Account } from "../../lib/types/account";
import { ICP } from "@dfinity/nns";

export const mockMainAccount: Account = {
  identifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balance: ICP.fromString("1234567.8901") as ICP,
};

export const mockAccountsStoreSubscribe = (
  run: Subscriber<AccountsStore>
): (() => void) => {
  run({ main: mockMainAccount });

  return () => {};
};
