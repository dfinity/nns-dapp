import {
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { i18n } from "$lib/stores/i18n";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { UpdateBalanceResult } from "@dfinity/ckbtc";
import { get } from "svelte/store";

export const getBTCAddress = async (): Promise<string> => {
  const identity = await getAuthenticatedIdentity();
  return getBTCAddressAPI({ identity });
};

export const updateBalance = async (): Promise<UpdateBalanceResult> => {
  const identity = await getAuthenticatedIdentity();
  const result = await updateBalanceAPI({ identity });

  if ("Err" in result) {
    const { Err } = result;

    if ("GenericError" in Err) {
      const {
        GenericError: { error_message, error_code },
      } = Err;
      throw new ApiErrorKey(`${error_message} (${error_code})`);
    }

    const labels = get(i18n);

    if ("TemporarilyUnavailable" in Err) {
      throw new ApiErrorKey(
        `${labels.error__ckbtc.temporary_unavailable} (${Err.TemporarilyUnavailable})`
      );
    }

    if ("AlreadyProcessing" in Err) {
      throw new ApiErrorKey(labels.error__ckbtc.already_process);
    }

    throw new ApiErrorKey(labels.error__ckbtc.no_new_utxo);
  }

  return result.Ok;
};
