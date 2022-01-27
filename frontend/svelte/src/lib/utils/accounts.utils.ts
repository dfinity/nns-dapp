import type { Principal } from "@dfinity/principal";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type { AccountsStore } from "../stores/accounts.store";

export const loadAccounts = async ({
  principal,
}: {
  principal: Principal;
}): Promise<AccountsStore> => {
  const ledger: LedgerCanister = LedgerCanister.create();

  const accountIdentifier: AccountIdentifier =
    AccountIdentifier.fromPrincipal(principal);

  const balance: ICP = await ledger.accountBalance(accountIdentifier, false);

  return {
    main: {
      identifier: accountIdentifier.toHex(),
      balance,
    },
  };
};
