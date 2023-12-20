import {
  estimateFee as estimateFeeAPI,
  getBTCAddress as getBTCAddressAPI,
  updateBalance as updateBalanceAPI,
} from "$lib/api/ckbtc-minter.api";
import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
import { i18n } from "$lib/stores/i18n";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { CanisterId } from "$lib/types/canister";
import { CkBTCErrorKey, CkBTCSuccessKey } from "$lib/types/ckbtc.errors";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { UniverseCanisterId } from "$lib/types/universe";
import { toToastError } from "$lib/utils/error.utils";
import { waitForMilliseconds } from "$lib/utils/utils";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
  type EstimateWithdrawalFee,
  type EstimateWithdrawalFeeParams,
  type PendingUtxo,
  type UpdateBalanceOk,
  type WithdrawalAccount,
} from "@dfinity/ckbtc";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import {
  getWithdrawalAccount as getWithdrawalAccountAPI,
  retrieveBtcStatusV2ByAccount,
} from "../api/ckbtc-minter.api";

const getBTCAddress = async (minterCanisterId: CanisterId): Promise<string> => {
  const identity = await getAuthenticatedIdentity();
  return getBTCAddressAPI({ identity, canisterId: minterCanisterId });
};

export const loadBtcAddress = async ({
  minterCanisterId,
  identifier,
}: {
  minterCanisterId: CanisterId;
  identifier: IcrcAccountIdentifierText;
}) => {
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

/**
 * Calls update_balance on the ckbtc minter and returns both completed and
 * pending UTXOs.
 */
const getPendingAndCompletedUtxos = async ({
  minterCanisterId,
}: {
  minterCanisterId: CanisterId;
}): Promise<{ completed: UpdateBalanceOk; pending: PendingUtxo[] }> => {
  const identity = await getAuthenticatedIdentity();
  const completedUtxos: UpdateBalanceOk = [];

  try {
    // The minter only returns pending UTXOs (as an error) if there are no
    // completed UTXOs. So we need to keep calling until it throws an error.
    // To avoid an infinite loop we stop after 3 attempts.
    for (let i = 0; i < 3; i++) {
      const response = await updateBalanceAPI({
        identity,
        canisterId: minterCanisterId,
      });
      completedUtxos.push(...response);
    }
  } catch (error: unknown) {
    if (!(error instanceof MinterNoNewUtxosError)) {
      throw error;
    }
    return { completed: completedUtxos, pending: error.pendingUtxos };
  }

  return { completed: completedUtxos, pending: [] };
};

/**
 * Calls update_balance on the ckbtc minter, which makes it check for incoming
 * BTC UTXOs with enough confirmations to credit ckBTC to the user's account.
 */
export const updateBalance = async ({
  universeId,
  minterCanisterId,
  reload,
  deferReload = false,
  uiIndicators = true,
}: {
  universeId: UniverseCanisterId;
  minterCanisterId: CanisterId;
  reload: (() => Promise<void>) | undefined;
  deferReload?: boolean;
  uiIndicators?: boolean;
}): Promise<{ success: boolean; err?: CkBTCErrorKey | unknown }> => {
  uiIndicators &&
    startBusy({
      initiator: "update-ckbtc-balance",
    });

  try {
    const { completed, pending } = await getPendingAndCompletedUtxos({
      minterCanisterId,
    });

    ckbtcPendingUtxosStore.setUtxos({ universeId, utxos: pending });

    // Workaround. Ultimately we want to poll to update balance and list of transactions
    if (deferReload) {
      await waitForMilliseconds(WALLET_TRANSACTIONS_RELOAD_DELAY);
    }

    if (uiIndicators) {
      if (completed.length > 0) {
        toastsSuccess({
          labelKey: "ckbtc.ckbtc_balance_updated",
        });
      } else {
        toastsSuccess({
          labelKey: "error__ckbtc.no_new_confirmed_btc",
        });
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const err = mapUpdateBalanceError(error);

    toastsError({
      labelKey: "error__ckbtc.update_balance",
      err,
    });

    return { success: false, err };
  } finally {
    // We reload in any case because the user might hit "Refresh balance" in the UI thinking the feature is meant to reload the account and transactions even though it is actually meant to confirm the conversion of BTC -> ckBTC
    await reload?.();

    uiIndicators && stopBusy("update-ckbtc-balance");
  }
};

const mapUpdateBalanceError = (
  err: unknown
): CkBTCErrorKey | CkBTCSuccessKey | unknown => {
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
    return new CkBTCSuccessKey(labels.error__ckbtc.no_new_confirmed_btc);
  }

  if (err instanceof MinterGenericError) {
    return new CkBTCErrorKey(err.message);
  }

  return err;
};

export const getWithdrawalAccount = async ({
  minterCanisterId,
}: {
  minterCanisterId: CanisterId;
}): Promise<WithdrawalAccount | undefined> => {
  const identity = await getAuthenticatedIdentity();

  try {
    const account = await getWithdrawalAccountAPI({
      identity,
      canisterId: minterCanisterId,
    });

    return account;
  } catch (err: unknown) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__ckbtc.withdrawal_account",
      })
    );

    return undefined;
  }
};

export const loadRetrieveBtcStatuses = async ({
  universeId,
  minterCanisterId,
}: {
  universeId: UniverseCanisterId;
  minterCanisterId: CanisterId;
}): Promise<void> => {
  const identity = await getAuthenticatedIdentity();
  const statuses = await retrieveBtcStatusV2ByAccount({
    identity,
    canisterId: minterCanisterId,
    certified: false,
  });
  ckbtcRetrieveBtcStatusesStore.setForUniverse({
    universeId,
    statuses,
  });
};
