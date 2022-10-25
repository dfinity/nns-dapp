import { getTransactions } from "$lib/api/sns-index.api";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import type { Account } from "$lib/types/account";
import type { Principal } from "@dfinity/principal";
import { decodeSnsAccount } from "@dfinity/sns";
import { getSnsAccountIdentity } from "./sns-accounts.services";

export const TRANSACTION_PAGE_SIZE = BigInt(50);

export const loadAccountTransactions = async ({
  account,
  rootCanisterId,
}: {
  account: Account;
  rootCanisterId: Principal;
}) => {
  // Only load transactions for one SNS project which we know the index canister id
  // TODO: Remove https://dfinity.atlassian.net/browse/GIX-1093
  if (rootCanisterId.toText() !== "tmxop-wyaaa-aaaaa-aaapa-cai") {
    return;
  }
  const identity = await getSnsAccountIdentity(account);
  const snsAccount = decodeSnsAccount(account.identifier);
  const { transactions, oldestTxId } = await getTransactions({
    identity,
    account: snsAccount,
    maxResults: TRANSACTION_PAGE_SIZE,
  });
  snsTransactionsStore.addTransactions({
    accountIdentifier: account.identifier,
    rootCanisterId,
    transactions,
    oldestTxId: oldestTxId ?? transactions[transactions.length - 1].id,
  });
};
