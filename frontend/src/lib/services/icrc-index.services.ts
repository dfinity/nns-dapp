import { getLedgerId as getLedgerIdApi } from "$lib/api/icrc-index.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { Principal } from "@dfinity/principal";

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
 * This function uses `ledger_id` icrc1 index canister api to check if the indexCanisterId is correctly associated with
 * the provided ledgerCanisterId.
 */
export const matchLedgerIndexPair = async ({
  ledgerCanisterId,
  indexCanisterId,
}: {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
}): Promise<boolean> => {
  try {
    const ledgerIdFromIndexCaniter = await getLedgerId({
      indexCanisterId,
      certified: false,
    });
    const match =
      ledgerIdFromIndexCaniter.toText() === ledgerCanisterId.toText();

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
