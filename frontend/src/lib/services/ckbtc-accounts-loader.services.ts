import { getCkBTCAccount } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
import { getWithdrawalAccount } from "$lib/services/ckbtc-minter.services";
import type { CkBTCBTCWithdrawalAccount } from "$lib/stores/ckbtc-accounts.store";
import { i18n } from "$lib/stores/i18n";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account, AccountType } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { assertNonNullish, fromNullable, isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

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

export const loadMinterCkBTCAccount = async ({
  universeId,
  certified,
  identity,
}: {
  universeId: UniverseCanisterId;
  certified: boolean;
  identity: Identity;
}): Promise<CkBTCBTCWithdrawalAccount> => {
  const canisters: CkBTCAdditionalCanisters | undefined =
    CKBTC_ADDITIONAL_CANISTERS[universeId.toText()];

  const {
    error__ckbtc: { no_minter_defined },
    ckbtc: { minter: name },
  } = get(i18n);

  if (isNullish(canisters?.minterCanisterId)) {
    toastsError({
      labelKey: "error__ckbtc.no_minter_defined",
    });
    throw new Error(no_minter_defined);
  }

  // We have to load the withdrawal account with an update call but, we use the query to indicate we are about to load the data
  if (!certified) {
    return {
      type: "minter",
    };
  }

  const { minterCanisterId } = canisters;

  // TODO: load only if needed
  // TODO: Support subaccounts
  const withdrawalAccount = await getWithdrawalAccount({ minterCanisterId });

  // withdrawalAccount should not be undefined to continue
  assertNonNullish(withdrawalAccount);

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
