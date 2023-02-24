import {
  estimateFee as estimateFeeAPI,
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { i18n } from "$lib/stores/i18n";
import { CkBTCErrorKey } from "$lib/types/ckbtc.errors";
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

export const estimateFee = async (
  params: EstimateFeeParams
): Promise<bigint> => {
  const identity = await getAuthenticatedIdentity();
  return estimateFeeAPI({ identity, ...params });
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
