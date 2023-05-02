import { getCkBTCAccount } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
import { getWithdrawalAccount } from "$lib/services/ckbtc-minter.services";
import { i18n } from "$lib/stores/i18n";
import type { Account, AccountType } from "$lib/types/account";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import type { UniverseCanisterId } from "$lib/types/universe";
import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { assertNonNullish, fromNullable, isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadAllCkBTCAccounts = async ({
  identity,
  certified,
  universeId,
}: {
  identity: Identity;
  certified: boolean;
  universeId: Principal;
}): Promise<Account[]> => {
  const mainAccount: { owner: Principal; type: AccountType } = {
    owner: identity.getPrincipal(),
    type: "main",
  };

  const promises = [
    getCkBTCAccount({
      identity,
      certified,
      canisterId: universeId,
      ...mainAccount,
    }),
    // TODO: to be removed when ckBTC with minter is live.
    // i.e. remove the isUniverseCkTESTBTC test only
    ...(certified && isUniverseCkTESTBTC(universeId)
      ? [loadMinterCkBTCAccount({ universeId, identity })]
      : []),
  ];

  return Promise.all(promises);
};

const loadMinterCkBTCAccount = async ({
  universeId,
  identity,
}: {
  universeId: UniverseCanisterId;
  identity: Identity;
}): Promise<Account> => {
  const canisters: CkBTCAdditionalCanisters | undefined =
    CKBTC_ADDITIONAL_CANISTERS[universeId.toText()];

  if (isNullish(canisters?.minterCanisterId)) {
    const $i18n = get(i18n);
    throw new Error($i18n.error__ckbtc.no_minter_defined);
  }

  const { minterCanisterId } = canisters;

  const withdrawalAccount = await getWithdrawalAccount({ minterCanisterId });

  // Account should be null here.
  assertNonNullish(withdrawalAccount);

  const account = await getCkBTCAccount({
    identity,
    certified: true,
    canisterId: universeId,
    owner: withdrawalAccount.owner,
    subaccount: fromNullable(withdrawalAccount.subaccount),
    type: "minter",
  });

  // TODO: label
  return {
    ...account,
    name: "Minter"
  };
};
