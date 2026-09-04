import { getLedgerId as getLedgerIdApi } from "$lib/api/icrc-index.api";
import { queryIcrcIndexPrincipal } from "$lib/api/icrc-ledger.api";
import {
  getAnonymousIdentity,
  getAuthenticatedIdentity,
} from "$lib/services/auth.services";
import { toastsError } from "$lib/stores/toasts.store";
import { nonNullish } from "@dfinity/utils";
import type { Principal } from "@icp-sdk/core/principal";

const getLedgerId = async ({
  indexCanisterId,
  certified,
}: {
  indexCanisterId: Principal;
  certified: boolean;
}): Promise<Principal> => {
  const identity = await getAuthenticatedIdentity();
  const ledgerId = await getLedgerIdApi({
    identity,
    indexCanisterId,
    certified,
  });
  return ledgerId;
};

/**
 * Validates whether the provided index canister ID corresponds to the given ledger canister ID.
 *
 * The function asks the ledger canister first, with the ICRC-106
 * `icrc106_get_index_principal` method. The ledger is the trusted side of the
 * pair, so its answer decides the result and the index canister is not called.
 *
 * Not every ledger names an index canister. When the ledger names none, the
 * function falls back to the `ledger_id` method of the index canister. That
 * answer comes from the canister under test, so it proves less.
 */
export const matchLedgerIndexPair = async ({
  ledgerCanisterId,
  indexCanisterId,
}: {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
}): Promise<boolean> => {
  try {
    // The user typed the ledger canister ID, so the call must not carry the
    // principal of the user to it.
    const indexIdFromLedgerCanister = await queryIcrcIndexPrincipal({
      identity: getAnonymousIdentity(),
      canisterId: ledgerCanisterId,
      certified: true,
    });

    let match: boolean;

    if (nonNullish(indexIdFromLedgerCanister)) {
      match = indexIdFromLedgerCanister.toText() === indexCanisterId.toText();
    } else {
      const ledgerIdFromIndexCanister = await getLedgerId({
        indexCanisterId,
        certified: true,
      });
      match = ledgerIdFromIndexCanister.toText() === ledgerCanisterId.toText();
    }

    if (!match) {
      toastsError({
        labelKey: "error.invalid_ledger_index_pair",
      });
    }
    return match;
  } catch (err) {
    console.error(err);
    toastsError({
      labelKey: "error.index_canister_validation",
      substitutions: {
        $indexCanister: indexCanisterId.toText(),
      },
      err,
    });
  }

  return false;
};
