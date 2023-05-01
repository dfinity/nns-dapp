import { RETRIEVE_BTC_MIN_AMOUNT } from "$lib/constants/bitcoin.constants";
import { i18n } from "$lib/stores/i18n";
import type { Account } from "$lib/types/account";
import type { CanisterId } from "$lib/types/canister";
import { CkBTCErrorRetrieveBtcMinAmount } from "$lib/types/ckbtc.errors";
import {
  AccountTransactionType,
  type Transaction,
} from "$lib/types/transaction";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken, numberToE8s } from "$lib/utils/token.utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { isNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const assertCkBTCUserInputAmount = ({
  networkBtc,
  sourceAccount,
  amount,
  bitcoinEstimatedFee,
  kytEstimatedFee,
  transactionFee,
}: {
  networkBtc: boolean;
  sourceAccount: Account | undefined;
  amount: number | undefined;
  bitcoinEstimatedFee: bigint | undefined | null;
  kytEstimatedFee: bigint | undefined | null;
  transactionFee: bigint;
}) => {
  if (!networkBtc) {
    return;
  }

  // No source account selected yet, we cannot check the available fund
  if (isNullish(sourceAccount)) {
    return;
  }

  // No additional check if no amount is entered
  if (isNullish(amount)) {
    return;
  }

  const amountE8s = numberToE8s(amount);

  // No additional check if amount is zero because user might be entering a value such as 0.00000...
  if (amountE8s === BigInt(0)) {
    return;
  }

  if (amountE8s < RETRIEVE_BTC_MIN_AMOUNT) {
    const {
      error__ckbtc: { retrieve_btc_min_amount },
    } = get(i18n);
    throw new CkBTCErrorRetrieveBtcMinAmount(
      replacePlaceholders(retrieve_btc_min_amount, {
        $amount: formatToken({
          value: RETRIEVE_BTC_MIN_AMOUNT,
          detailed: true,
        }),
      })
    );
  }

  assertEnoughAccountFunds({
    account: sourceAccount,
    amountE8s:
      amountE8s +
      transactionFee +
      (bitcoinEstimatedFee ?? BigInt(0)) +
      (kytEstimatedFee ?? BigInt(0)),
  });
};

export const transactionDescription = ({
  transaction: { type, to },
  minterCanisterId,
}: {
  transaction: Transaction;
  minterCanisterId: CanisterId;
}): string | undefined => {
  const {
    ckbtc_transaction_names: { mint, burn },
  } = get(i18n);

  if (type === AccountTransactionType.Mint) {
    return mint;
  }

  if (type === AccountTransactionType.Send && nonNullish(to)) {
    const { owner } = decodeIcrcAccount(to);

    if (owner.toText() === minterCanisterId.toText()) {
      return burn;
    }
  }

  return undefined;
};
