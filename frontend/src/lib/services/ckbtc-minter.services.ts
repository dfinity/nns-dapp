import {
  estimateFee as estimateFeeAPI,
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { i18n } from "$lib/stores/i18n";
import { toastsError } from "$lib/stores/toasts.store";
import { CkBTCErrorKey } from "$lib/types/ckbtc.errors";
import { toToastError } from "$lib/utils/error.utils";
import type { UpdateBalanceResult } from "@dfinity/ckbtc";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
  type EstimateFeeParams,
} from "@dfinity/ckbtc";
import { get } from "svelte/store";

export const getBTCAddress = async (): Promise<string> => {
  const identity = await getAuthenticatedIdentity();
  return getBTCAddressAPI({ identity });
};

export const estimateFee = async ({
  params,
  callback,
}: {
  params: EstimateFeeParams;
  callback: (fee: bigint | null) => void;
}): Promise<void> => {
  return queryAndUpdate<bigint, unknown>({
    request: ({ certified, identity }) =>
      estimateFeeAPI({ identity, certified, ...params }),
    onLoad: ({ response: fee }) => callback(fee),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      callback(null);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__ckbtc.estimated_fee",
        })
      );
    },
    logMessage: "Getting Bitcoin estimated fee",
  });
};

export const updateBalance = async (): Promise<UpdateBalanceResult> => {
  const identity = await getAuthenticatedIdentity();

  try {
    return await updateBalanceAPI({ identity });
  } catch (err: unknown) {
    throwUpdateBalanceError(err);

    throw err;
  }
};

const throwUpdateBalanceError = (err: unknown) => {
  const labels = get(i18n);

  if (err instanceof MinterTemporaryUnavailableError) {
    throw new CkBTCErrorKey(
      `${labels.error__ckbtc.temporary_unavailable} (${err.message})`
    );
  }

  if (err instanceof MinterAlreadyProcessingError) {
    throw new CkBTCErrorKey(labels.error__ckbtc.already_process);
  }

  if (err instanceof MinterNoNewUtxosError) {
    throw new CkBTCErrorKey(labels.error__ckbtc.no_new_utxo);
  }

  if (err instanceof MinterGenericError) {
    throw new CkBTCErrorKey(err.message);
  }
};
