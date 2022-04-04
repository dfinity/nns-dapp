import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";

/*
 * Returns the principal's main or hardware account
 *
 * Subaccounts do not have Principal
 */
export const getAccountByPrincipal = ({
  principal,
  accounts,
}: {
  principal: string;
  accounts: AccountsStore;
}): Account | undefined => {
  if (accounts.main?.principal?.toText() === principal) {
    return accounts.main;
  }

  // TODO: Check also the hardware wallets L2-433
  return undefined;
};
