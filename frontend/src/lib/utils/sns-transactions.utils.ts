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

// TODO: use `oldestTxId` instead of sorting and getting the oldest element's id.
// It seems that the `Index` canister has a bug.
/**
 * Returns the oldest transaction id of an SNS account.
 *
 * @param params
 * @param {Account} params.account
 * @param {Principal} params.rootCanisterId
 * @param {IcrcTransactionsStoreData} params.store
 * @returns {bigint}
 */
export const getOldestTxIdFromStore = ({
  store,
  rootCanisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  rootCanisterId: Principal;
  account: Account;
}): bigint | undefined => {
  const accountData = store[rootCanisterId.toText()]?.[account.identifier];
  if (accountData === undefined) {
    return;
  }
  return accountData.transactions.sort((a, b) =>
    Number(a.transaction.timestamp - b.transaction.timestamp)
  )[0].id;
};
