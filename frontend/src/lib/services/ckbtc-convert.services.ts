import { retrieveBtcWithApproval } from "$lib/api/ckbtc-minter.api";
import { approveTransfer } from "$lib/api/icrc-ledger.api";
import { NANO_SECONDS_IN_MINUTE } from "$lib/constants/constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import type { IcrcTransferTokensUserParams } from "$lib/services/icrc-accounts.services";
import { loadAccounts as loadWalletAccounts } from "$lib/services/icrc-accounts.services";
import { loadIcrcAccountTransactions } from "$lib/services/icrc-transactions.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { CanisterId } from "$lib/types/canister";
import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
import type { UniverseCanisterId } from "$lib/types/universe";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import {
  MinterAlreadyProcessingError,
  MinterAmountTooLowError,
  MinterGenericError,
  MinterInsufficientFundsError,
  MinterMalformedAddressError,
  MinterTemporaryUnavailableError,
} from "@dfinity/ckbtc";
import { nonNullish } from "@dfinity/utils";

export type ConvertCkBTCToBtcParams = {
  destinationAddress: string;
  amount: number;
  universeId: UniverseCanisterId;
  canisters: CkBTCAdditionalCanisters;
  updateProgress: (step: ConvertBtcStep) => void;
};

/**
 * Convert ckBTC to BTC with ICRC-2
 *
 * 1. Approve transfer (ledger.icrc2_approve).
 * 2. Request BTC (minter.retrieve_btc_with_approval).
 */
export const convertCkBTCToBtcIcrc2 = async ({
  destinationAddress,
  amount,
  source,
  universeId,
  canisters: { minterCanisterId, indexCanisterId },
  updateProgress,
}: ConvertCkBTCToBtcParams &
  Pick<IcrcTransferTokensUserParams, "source">): Promise<{
  success: boolean;
}> => {
  try {
    const identity = await getAuthenticatedIdentity();

    updateProgress(ConvertBtcStep.APPROVE_TRANSFER);

    await approveTransfer({
      identity,
      canisterId: universeId,
      amount: numberToE8s(amount),
      // 5 minutes should be long enough to perform the transfer but if it
      // doesn't succeed we don't want the approval to remain valid
      // indefinitely.
      expiresAt: nowInBigIntNanoSeconds() + BigInt(5 * NANO_SECONDS_IN_MINUTE),
      spender: minterCanisterId,
    });

    updateProgress(ConvertBtcStep.SEND_BTC);

    await retrieveBtcWithApproval({
      identity,
      canisterId: minterCanisterId,
      address: destinationAddress,
      amount: numberToE8s(amount),
    });
  } catch (err: unknown) {
    toastsError(toastRetrieveBtcError(err));

    return { success: false };
  } finally {
    await reload({
      source,
      universeId,
      indexCanisterId,
      loadAccounts: true,
      updateProgress,
    });
  }

  updateProgress(ConvertBtcStep.DONE);

  return { success: true };
};

const reload = async ({
  source,
  universeId,
  indexCanisterId,
  loadAccounts,
  updateProgress,
}: {
  source?: Account;
  universeId: UniverseCanisterId;
  indexCanisterId: CanisterId;
  loadAccounts: boolean;
  updateProgress: (step: ConvertBtcStep) => void;
}): Promise<void> => {
  updateProgress(ConvertBtcStep.RELOAD);

  // Reload:
  // - if provided, the transactions of the account for which the transfer was executed
  await Promise.all([
    ...(loadAccounts
      ? [loadWalletAccounts({ ledgerCanisterId: universeId })]
      : []),
    ...(nonNullish(source)
      ? [
          loadIcrcAccountTransactions({
            account: source,
            ledgerCanisterId: universeId,
            indexCanisterId,
          }),
        ]
      : []),
  ]);
};

const toastRetrieveBtcError = (
  err: unknown
): { labelKey: string; err: unknown } => {
  if (err instanceof MinterTemporaryUnavailableError) {
    return {
      labelKey: "error__ckbtc.temporary_unavailable",
      err,
    };
  }

  if (err instanceof MinterAlreadyProcessingError) {
    return {
      labelKey: "error__ckbtc.already_process",
      err,
    };
  }

  if (err instanceof MinterMalformedAddressError) {
    return {
      labelKey: "error__ckbtc.malformed_address",
      err,
    };
  }

  if (err instanceof MinterAmountTooLowError) {
    return {
      labelKey: "error__ckbtc.amount_too_low",
      err,
    };
  }

  if (err instanceof MinterInsufficientFundsError) {
    return {
      labelKey: "error__ckbtc.insufficient_funds",
      err,
    };
  }

  if (err instanceof MinterGenericError) {
    return {
      labelKey: "error__ckbtc.retrieve_btc",
      err,
    };
  }

  return {
    labelKey: "error__ckbtc.retrieve_btc_unknown",
    err,
  };
};
