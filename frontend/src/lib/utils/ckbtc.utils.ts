import { i18n } from "$lib/stores/i18n";
import type { Account } from "$lib/types/account";
import { CkBTCErrorRetrieveBtcMinAmount } from "$lib/types/ckbtc.errors";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken, numberToE8s } from "$lib/utils/token.utils";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const assertCkBTCUserInputAmount = ({
  networkBtc,
  sourceAccount,
  amount,
  transactionFee,
  retrieveBtcMinAmount,
}: {
  networkBtc: boolean;
  sourceAccount: Account | undefined;
  amount: number | undefined;
  transactionFee: bigint;
  retrieveBtcMinAmount: bigint | undefined;
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

  // The minimal amount to retrieve of BTC may have not been loaded yet.
  if (isNullish(retrieveBtcMinAmount)) {
    const {
      error__ckbtc: { retrieve_btc_min_amount_unknown },
    } = get(i18n);
    throw new CkBTCErrorRetrieveBtcMinAmount(retrieve_btc_min_amount_unknown);
  }

  if (amountE8s < retrieveBtcMinAmount) {
    const {
      error__ckbtc: { retrieve_btc_min_amount },
    } = get(i18n);
    throw new CkBTCErrorRetrieveBtcMinAmount(
      replacePlaceholders(retrieve_btc_min_amount, {
        $amount: formatToken({
          value: retrieveBtcMinAmount,
          detailed: true,
        }),
      })
    );
  }

  assertEnoughAccountFunds({
    account: sourceAccount,
    amountE8s: amountE8s + transactionFee,
  });
};
