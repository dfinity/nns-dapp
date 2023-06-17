import { transactionFee as snsTransactionFee } from "$lib/api/sns-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { toastsError } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import type { Principal } from "@dfinity/principal/lib/cjs";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

export const loadSnsTransactionFee = async ({
  rootCanisterId,
  handleError,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
}) => {
  const storeData = get(transactionsFeesStore);
  // Avoid loading the same data multiple times if the data loaded is certified
  if (storeData.projects[rootCanisterId.toText()]?.certified) {
    return;
  }
  return queryAndUpdate<bigint, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      snsTransactionFee({
        identity,
        rootCanisterId,
        certified,
      }),
    onLoad: async ({ response: fee, certified }) => {
      transactionsFeesStore.setFee({ certified, rootCanisterId, fee });
    },
    onError: ({ error: err, certified }) => {
      if (!certified && notForceCallStrategy()) {
        return;
      }

      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error.transaction_fee_not_found",
        err,
      });

      handleError?.();
    },
  });
};
