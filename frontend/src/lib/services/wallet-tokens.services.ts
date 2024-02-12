import { getToken } from "$lib/api/wallet-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsTokensByLedgerCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { queryAndUpdate } from "$lib/services/utils.services";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

export const loadToken = async ({
  handleError,
  ledgerCanisterId,
}: {
  handleError?: () => void;
  ledgerCanisterId: Principal;
}) => {
  // Currently we assume the token metadata does not change that often and might never change while the session is active
  // That's why, we load the token for a project only once as long as its data is already certified
  if (ledgerCanisterId.toText() in get(snsTokensByLedgerCanisterIdStore)) {
    // SNS tokens are derived from aggregator data instead.
    return;
  }

  const storeData = get(tokensStore);
  if (storeData[ledgerCanisterId.toText()]?.certified) {
    return;
  }

  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    identityType: "current",
    request: ({ certified, identity }) =>
      getToken({
        identity,
        certified,
        canisterId: ledgerCanisterId,
      }),
    onLoad: async ({ response: token, certified }) =>
      tokensStore.setToken({
        certified,
        canisterId: ledgerCanisterId,
        token,
      }),
    onError: ({ error: err, certified }) => {
      if (!certified && notForceCallStrategy()) {
        return;
      }

      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error.token_not_found",
        err,
      });

      // Hide unproven data
      tokensStore.resetUniverse(ledgerCanisterId);

      handleError?.();
    },
  });
};
