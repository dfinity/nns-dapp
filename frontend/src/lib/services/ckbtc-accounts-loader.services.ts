import { getCkBTCAccount } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
import { getWithdrawalAccount } from "$lib/services/ckbtc-minter.services";
import { i18n } from "$lib/stores/i18n";
import type { Account, AccountType } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { fromNullable, isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadCkBTCAccounts = async ({
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

export const loadMinterCkBTCAccount = async ({
  universeId,
  certified,
  identity,
}: {
  universeId: UniverseCanisterId;
  certified: boolean;
  identity: Identity;
}): Promise<Account | undefined> => {
  const canisters: CkBTCAdditionalCanisters | undefined =
    CKBTC_ADDITIONAL_CANISTERS[universeId.toText()];

  const {
    error__ckbtc: { no_minter_defined },
    ckbtc: { minter: name },
  } = get(i18n);

  if (isNullish(canisters?.minterCanisterId)) {
    throw new Error(no_minter_defined);
  }

  const { minterCanisterId } = canisters;

  // TODO: load only if needed
  const withdrawalAccount = !certified
    ? undefined
    : await getWithdrawalAccount({ minterCanisterId });

  if (isNullish(withdrawalAccount)) {
    return undefined;
  }

  const account = await getCkBTCAccount({
    identity,
    certified,
    canisterId: universeId,
    owner: withdrawalAccount.owner,
    subaccount: fromNullable(withdrawalAccount.subaccount),
    type: "minter",
  });

  return {
    ...account,
    name,
  };
};
