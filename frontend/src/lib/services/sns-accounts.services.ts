import { getSnsAccounts, transfer } from "$lib/api/sns-ledger.api";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import type { Identity } from "@dfinity/agent";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { getIdentity } from "./auth.services";
import { loadSnsTransactionFee } from "./transaction-fees.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsAccounts = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<Account[], unknown>({
    request: ({ certified, identity }) =>
      getSnsAccounts({ rootCanisterId, identity, certified }),
    onLoad: ({ response: accounts, certified }) =>
      snsAccountsStore.setAccounts({
        accounts,
        rootCanisterId,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsAccountsStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_accounts_load",
        })
      );
    },
    logMessage: "Syncing Sns Accounts",
  });
};

export const syncSnsAccounts = async (rootCanisterId: Principal) => {
  await Promise.all([
    loadSnsAccounts(rootCanisterId),
    loadSnsTransactionFee(rootCanisterId),
  ]);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAccountIdentity = async (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  const identity = await getIdentity();
  return identity;
};

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  destinationAddress,
  amount,
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  amount: TokenAmount;
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity = await getAccountIdentity(source);
    const to = decodeSnsAccount(destinationAddress);

    await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      e8s: amount.toE8s(),
      rootCanisterId,
    });

    await loadSnsAccounts(rootCanisterId);

    return { success: true };
  } catch (err) {
    toToastError({ fallbackErrorLabelKey: "error.transaction_error", err });
    return { success: false };
  }
};
