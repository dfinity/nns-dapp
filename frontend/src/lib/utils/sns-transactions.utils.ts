import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import type { Account } from "$lib/types/account";
import type { Principal } from "@dfinity/principal";

/**
 * Returns whether all transactions of an SNS account have been loaded.
 *
 * @param params
 * @param {Account} params.account
 * @param {Principal} params.rootCanisterId
 * @param {IcrcTransactionsStoreData} params.store
 * @returns {boolean}
 */
export const isSnsTransactionsCompleted = ({
  store,
  rootCanisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  rootCanisterId: Principal;
  account: Account;
}): boolean =>
  Boolean(store[rootCanisterId.toText()]?.[account.identifier].completed);
