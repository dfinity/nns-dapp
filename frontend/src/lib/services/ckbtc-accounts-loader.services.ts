import { getCkBTCAccount } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
import { getWithdrawalAccount as getWithdrawalAccountServices } from "$lib/services/ckbtc-minter.services";
import type { CkBTCBTCWithdrawalAccount } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import { i18n } from "$lib/stores/i18n";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account, AccountType } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount } from "@dfinity/ledger";
import { decodeIcrcAccount } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import {
  assertNonNullish,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
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

/**
 * 1. If not yet loaded, get the ckBTC withdrawal account from the minter, otherwise use the existing value in store.
 * 2. Get the related account metadata information and balance from the ckBTC ledger
 *
 * Note: the minter provides the ckBTC withdrawal account only through an update call. Because we have to display the loading in the UI to the user, this function returns a partial account if a query is started.
 *
 * @returns a NNS-dapp account of type "withdrawalAccount"
 */
export const getCkBTCWithdrawalAccount = async ({
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
    accounts: { withdrawalAccount: name },
  } = get(i18n);

  if (isNullish(canisters?.minterCanisterId)) {
    toastsError({
      labelKey: "error__ckbtc.no_minter_defined",
    });
    throw new Error(no_minter_defined);
  }

  const getWithdrawalAccount = async (): Promise<IcrcAccount> => {
    const { minterCanisterId } = canisters;

    const account = await getWithdrawalAccountServices({ minterCanisterId });

    // withdrawalAccount should not be undefined to continue
    assertNonNullish(account);

    return {
      owner: account.owner,
      subaccount: fromNullable(account.subaccount),
    };
  };

  const store = get(ckBTCWithdrawalAccountsStore);
  const storedWithdrawalAccount = store[universeId.toText()];

  // We have to load the withdrawal account with an update call.
  // If we never have loaded it, we return a empty account as result of the not certified (query) call to indicate we are about to load the data.
  if (!certified && isNullish(storedWithdrawalAccount?.account.identifier)) {
    return {
      type: "withdrawalAccount",
    };
  }

  // We do not reload the withdrawal account for performance reason
  const withdrawalAccount = nonNullish(
    storedWithdrawalAccount?.account.identifier
  )
    ? decodeIcrcAccount(storedWithdrawalAccount.account.identifier)
    : await getWithdrawalAccount();
  try {
    const account = await getCkBTCAccount({
      identity,
      certified,
      canisterId: universeId,
      ...withdrawalAccount,
      type: "withdrawalAccount",
    });

    return {
      ...account,
      name,
    };
  } catch (err: unknown) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error.accounts_load",
      })
    );

    throw err;
  }
};
