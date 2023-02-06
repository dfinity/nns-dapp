import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { isNullish } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { decodeIcrcAccount } from "@dfinity/ledger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIcrcAccountIdentity = (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  return getAuthenticatedIdentity();
};

///
/// These following services are implicitly covered by their consumers' services testing - i.e. ckbtc-accounts.services.spec and sns-accounts.services.spec
///

export const transferTokens = async ({
  source,
  destinationAddress,
  amount,
  fee,
  transfer,
  reloadAccounts,
  reloadTransactions,
}: {
  source: Account;
  destinationAddress: string;
  amount: number;
  fee: bigint | undefined;
  transfer: (
    params: {
      identity: Identity;
    } & Omit<IcrcTransferParams, "transfer">
  ) => Promise<void>;
  reloadAccounts: () => Promise<void>;
  reloadTransactions: () => Promise<void>;
}): Promise<{ success: boolean }> => {
  try {
    if (isNullish(fee)) {
      throw new Error("error.transaction_fee_not_found");
    }

    const amountE8s = numberToE8s(amount);
    const identity: Identity = await getIcrcAccountIdentity(source);
    const to = decodeIcrcAccount(destinationAddress);

    await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      amount: amountE8s,
      fee,
    });

    await Promise.all([reloadAccounts(), reloadTransactions()]);

    return { success: true };
  } catch (err) {
    toastsError(
      ledgerErrorToToastError({
        fallbackErrorLabelKey: "error.transaction_error",
        err,
      })
    );

    return { success: false };
  }
};
