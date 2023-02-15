import type { WithdrawalAccount } from "@dfinity/ckbtc";
import {
  MinterAlreadyProcessingError,
  MinterAmountTooLowError,
  MinterGenericError,
  MinterInsufficientFundsError,
  MinterMalformedAddressError,
  MinterTemporaryUnavailableError,
} from "@dfinity/ckbtc";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { assertNonNullish, fromNullable } from "@dfinity/utils";
import { getWithdrawalAccount, retrieveBtc } from "../api/ckbtc-minter.api";
import { toastsError } from "../stores/toasts.store";
import { toToastError } from "../utils/error.utils";
import { numberToE8s } from "../utils/token.utils";
import { getAuthenticatedIdentity } from "./auth.services";
import { ckBTCTransferTokens } from "./ckbtc-accounts.services";
import { loadCkBTCAccountTransactions } from "./ckbtc-transactions.services";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";

/**
 * Convert ckBTC to BTC.
 *
 * 1. get_withdrawal_account -> get ckBTC address (account)
 * 2. icrc1_transfer(account)
 * 3. retrieve_btc
 *
 * @param (IcrcTransferTokensUserParams) params
 */
export const convertCkBTCToBtc = async ({
  destinationAddress: bitcoinAddress,
  amount,
  source,
}: IcrcTransferTokensUserParams): Promise<{ success: boolean }> => {
  const identity = await getAuthenticatedIdentity();

  let account: WithdrawalAccount | undefined;

  try {
    account = await getWithdrawalAccount({ identity });
  } catch (err: unknown) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__ckbtc.withdrawal_account",
      })
    );

    return { success: false };
  }

  // Account cannot be null here. We add this guard to comply with type safety.
  assertNonNullish(account);

  const ledgerAddress = encodeIcrcAccount({
    owner: account.owner,
    subaccount: fromNullable(account.subaccount),
  });

  // We reload the transactions only at the end of the process for performance reason.
  const { success: transferSuccess } = await ckBTCTransferTokens({
    source,
    amount,
    destinationAddress: ledgerAddress,
    loadTransactions: false,
  });

  if (!transferSuccess) {
    return { success: false };
  }

  // TODO(GIX-1324): how do we handle failure between these steps UX wise since

  try {
    await retrieveBtc({
      identity,
      address: bitcoinAddress,
      amount: numberToE8s(amount),
    });
  } catch (err: unknown) {
    toastsError(toastRetrieveBtcError(err));

    return { success: false };
  } finally {
    await loadCkBTCAccountTransactions({
      account: source,
    });
  }

  return { success: true };
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
