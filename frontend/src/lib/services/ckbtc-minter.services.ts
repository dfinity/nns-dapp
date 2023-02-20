import {
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { i18n } from "$lib/stores/i18n";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { UpdateBalanceResult } from "@dfinity/ckbtc";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
} from "@dfinity/ckbtc";
import { get } from "svelte/store";

export const getBTCAddress = async (): Promise<string> => {
  const identity = await getAuthenticatedIdentity();
  return getBTCAddressAPI({ identity });
};

export const updateBalance = async (): Promise<UpdateBalanceResult> => {
  const identity = await getAuthenticatedIdentity();

  try {
    return await updateBalanceAPI({ identity });
  } catch (err: unknown) {
    const labels = get(i18n);

    // Specific errors extending MinterGenericError. Therefore, we check them first.
    if (err instanceof MinterTemporaryUnavailableError) {
      throw new ApiErrorKey(
        `${labels.error__ckbtc.temporary_unavailable} (${err.message})`
      );
    }

    if (err instanceof MinterAlreadyProcessingError) {
      throw new ApiErrorKey(labels.error__ckbtc.already_process);
    }

    if (err instanceof MinterNoNewUtxosError) {
      throw new ApiErrorKey(labels.error__ckbtc.no_new_utxo);
    }

    if (err instanceof MinterGenericError) {
      throw new ApiErrorKey(err.message);
    }

    throw err;
  }
};
