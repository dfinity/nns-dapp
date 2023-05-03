import { getCkBTCAccount } from "$lib/api/ckbtc-ledger.api";
import type { Account, AccountType } from "$lib/types/account";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export const getCkBTCAccounts = async ({
  identity,
  certified,
  universeId,
}: {
  identity: Identity;
  certified: boolean;
  universeId: Principal;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  const mainAccount: { owner: Principal; type: AccountType } = {
    owner: identity.getPrincipal(),
    type: "main",
  };

  const account = await getCkBTCAccount({
    identity,
    certified,
    canisterId: universeId,
    ...mainAccount,
  });

  return [account];
};
