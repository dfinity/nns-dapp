import {
  depositFee as depositFeeAPI,
  estimateFee as estimateFeeAPI,
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { i18n } from "$lib/stores/i18n";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { AccountIdentifierText } from "$lib/types/account";
import type { CanisterId } from "$lib/types/canister";
import { CkBTCErrorKey } from "$lib/types/ckbtc.errors";
import type { UniverseCanisterId } from "$lib/types/universe";
import { toToastError } from "$lib/utils/error.utils";
import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
  type EstimateWithdrawalFee,
  type EstimateWithdrawalFeeParams,
} from "@dfinity/ckbtc";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

const getBTCAddress = async (minterCanisterId: CanisterId): Promise<string> => {
  const identity = await getAuthenticatedIdentity();
  return getBTCAddressAPI({ identity, canisterId: minterCanisterId });
};

export const loadBtcAddress = async ({
  minterCanisterId,
  universeId,
  identifier,
}: {
  minterCanisterId: CanisterId;
  universeId: UniverseCanisterId;
  identifier: AccountIdentifierText;
}) => {
  // TODO: to be removed when ckBTC with minter is live.
  if (!isUniverseCkTESTBTC(universeId)) {
    return;
  }

  const store = get(bitcoinAddressStore);
  const btcAddressLoaded = nonNullish(store[identifier]);

  // We load the BTC address once per session
  if (btcAddressLoaded) {
    return;
  }

  try {
    const btcAddress = await getBTCAddress(minterCanisterId);

    bitcoinAddressStore.set({ identifier, btcAddress });
  } catch (err: unknown) {
    toastsError({
      labelKey: "error__ckbtc.get_btc_address",
      err,
    });
  }
};

export const estimateFee = async ({
  params,
  minterCanisterId,
  callback,
}: {
  params: EstimateWithdrawalFeeParams;
  minterCanisterId: CanisterId;
  callback: (fee: EstimateWithdrawalFee | null) => void;
}): Promise<void> => {
  return queryAndUpdate<EstimateWithdrawalFee, unknown>({
    request: ({ certified, identity }) =>
      estimateFeeAPI({
        identity,
        certified,
        canisterId: minterCanisterId,
        ...params,
      }),
    onLoad: ({ response: fee }) => callback(fee),
    onError: ({ error: err, certified }) => {
      console.error(err);

      // hide fee on any error
      callback(null);

      if (certified !== true) {
        return;
      }

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

export const depositFee = async ({
  minterCanisterId,
  callback,
}: {
  minterCanisterId: CanisterId;
  callback: (fee: bigint | null) => void;
}): Promise<void> => {
  return queryAndUpdate<bigint, unknown>({
    request: ({ certified, identity }) =>
      depositFeeAPI({
        identity,
        certified,
        canisterId: minterCanisterId,
      }),
    onLoad: ({ response: fee }) => callback(fee),
    onError: ({ error: err, certified }) => {
      console.error(err);

      // hide fee on any error
      callback(null);

      if (certified !== true) {
        return;
      }

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__ckbtc.deposit_fee",
        })
      );
    },
    logMessage: "Getting Bitcoin deposit fee",
  });
};

export const updateBalance = async ({
  minterCanisterId,
  reload,
}: {
  minterCanisterId: CanisterId;
  reload: (() => Promise<void>) | undefined;
}): Promise<{ success: boolean; err?: unknown }> => {
  startBusy({
    initiator: "update-ckbtc-balance",
  });

  const identity = await getAuthenticatedIdentity();

  try {
    await updateBalanceAPI({ identity, canisterId: minterCanisterId });

    await reload?.();

    toastsSuccess({
      labelKey: "ckbtc.ckbtc_balance_updated",
    });

    return { success: true };
  } catch (error: unknown) {
    const err = mapUpdateBalanceError(error);

    toastsError({
      labelKey: "error__ckbtc.update_balance",
      err,
    });

    return { success: false, err };
  } finally {
    stopBusy("update-ckbtc-balance");
  }
};

const mapUpdateBalanceError = (err: unknown): unknown => {
  const labels = get(i18n);

  if (err instanceof MinterTemporaryUnavailableError) {
    return new CkBTCErrorKey(
      `${labels.error__ckbtc.temporary_unavailable} (${err.message})`
    );
  }

  if (err instanceof MinterAlreadyProcessingError) {
    return new CkBTCErrorKey(labels.error__ckbtc.already_process);
  }

  if (err instanceof MinterNoNewUtxosError) {
    return new CkBTCErrorKey(labels.error__ckbtc.no_new_utxo);
  }

  if (err instanceof MinterGenericError) {
    return new CkBTCErrorKey(err.message);
  }

  return err;
};
