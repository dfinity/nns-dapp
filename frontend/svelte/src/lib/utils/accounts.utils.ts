import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { AccountsStore } from "../stores/accounts.store";
import { agent } from "./agent.utils";

export const loadAccounts = async ({
  principal,
}: {
  principal: Principal;
}): Promise<AccountsStore> => {
  const ledger: LedgerCanister = LedgerCanister.create({ agent });

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
