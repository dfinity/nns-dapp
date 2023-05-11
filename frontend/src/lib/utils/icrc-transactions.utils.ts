import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type {
  IcrcTransactionData,
  IcrcTransactionInfo,
  Transaction,
} from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import type { UniverseCanisterId } from "$lib/types/universe";
import type { IcrcTransaction, IcrcTransactionWithId } from "@dfinity/ledger";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { mapToSelfTransaction, showTransactionFee } from "./transactions.utils";

/**
 * Returns transactions of an SNS account sorted by date (newest first).
 * Filters out duplicated transactions.
 * A duplicated transaction is normally one made to itself.
 * The data of the duplicated transaction is the same in both transactions. No need to show it twice.
 *
 * @param params
 * @param {Account} params.account
 * @param {UniverseCanisterId} params.canisterId
 * @param {IcrcTransactionsStoreData} params.store
 * @returns {SnsTransactionWithId[]}
 */
export const getSortedTransactionsFromStore = ({
  store,
  canisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  canisterId: UniverseCanisterId;
  account: Account;
}): IcrcTransactionData[] =>
  mapToSelfTransaction(
    store[canisterId.toText()]?.[account.identifier]?.transactions ?? []
  ).sort(({ transaction: txA }, { transaction: txB }) =>
    Number(txB.transaction.timestamp - txA.transaction.timestamp)
  );

const getIcrcTransactionType = ({
  transaction,
  governanceCanisterId,
}: {
  transaction: IcrcTransaction;
  governanceCanisterId?: Principal;
}): AccountTransactionType => {
  if (fromNullable(transaction.burn) !== undefined) {
    return AccountTransactionType.Burn;
  }
  if (fromNullable(transaction.mint) !== undefined) {
    return AccountTransactionType.Mint;
  }
  const transfer = fromNullable(transaction.transfer);
  if (transfer !== undefined) {
    // A transaction to an account owned by the governance canister stakes a neuron.
    if (transfer.to.owner.toText() === governanceCanisterId?.toText()) {
      // Staking a neuron uses a memo, but topping up a neuron does not.
      if (transfer.memo.length > 0) {
        return AccountTransactionType.StakeNeuron;
      }
      return AccountTransactionType.TopUpNeuron;
    }
    return AccountTransactionType.Send;
  }
  // Just for type safety. This should never happen.
  throw new Error(`Unknown transaction type ${transaction.kind}`);
};

const getTransactionInformation = (
  transaction: IcrcTransaction
): IcrcTransactionInfo | undefined => {
  const data =
    fromNullable(transaction.burn) ??
    fromNullable(transaction.mint) ??
    fromNullable(transaction.transfer);
  // Edge case, a transaction will have either "burn", "mint" or "transfer" data.
  if (data === undefined) {
    throw new Error(`Unknown transaction type ${JSON.stringify(transaction)}`);
  }
  // Fee is only present in "transfer" transactions.
  const fee = fromNullable(fromNullable(transaction.transfer)?.fee ?? []);
  return {
    from:
      "from" in data
        ? encodeIcrcAccount({
            owner: data.from.owner,
            subaccount: fromNullable(data.from.subaccount),
          })
        : undefined,
    to:
      "to" in data
        ? encodeIcrcAccount({
            owner: data.to.owner,
            subaccount: fromNullable(data.to.subaccount),
          })
        : undefined,
    memo: fromNullable(data?.memo),
    created_at_time: fromNullable(data?.created_at_time),
    amount: data?.amount,
    fee,
  };
};

export const mapIcrcTransaction = ({
  transaction,
  account,
  toSelfTransaction,
  governanceCanisterId,
}: {
  transaction: IcrcTransactionWithId;
  account: Account;
  toSelfTransaction: boolean;
  governanceCanisterId?: Principal;
}): Transaction | undefined => {
  try {
    const type = getIcrcTransactionType({
      transaction: transaction.transaction,
      governanceCanisterId,
    });
    const txInfo = getTransactionInformation(transaction.transaction);
    if (txInfo === undefined) {
      throw new Error(
        `Unknown transaction type ${transaction.transaction.kind}`
      );
    }
    const isReceive =
      toSelfTransaction === true || txInfo.from !== account.identifier;
    const isSend = txInfo.to !== account.identifier;
    const useFee =
      toSelfTransaction === true
        ? false
        : showTransactionFee({ type, isReceive });
    const feeApplied =
      useFee && txInfo.fee !== undefined ? txInfo.fee : BigInt(0);

    // Timestamp is in nano seconds
    const timestampMilliseconds =
      Number(transaction.transaction.timestamp) / NANO_SECONDS_IN_MILLISECOND;
    return {
      type,
      isReceive,
      isSend,
      from: txInfo.from,
      to: txInfo.to,
      displayAmount: TokenAmount.fromE8s({
        amount: txInfo.amount + feeApplied,
        token: account.balance.token,
      }),
      date: new Date(timestampMilliseconds),
    };
  } catch (err) {
    toastsError({
      labelKey: "error.transaction_data",
      substitutions: { $txId: String(transaction.id) },
      err,
    });
  }
};

// TODO: use `oldestTxId` instead of sorting and getting the oldest element's id.
// It seems that the `Index` canister has a bug.
/**
 * Returns the oldest transaction id of an Icrc account.
 *
 * @param params
 * @param {Account} params.account
 * @param {Principal} params.rootCanisterId
 * @param {IcrcTransactionsStoreData} params.store
 * @returns {bigint}
 */
export const getOldestTxIdFromStore = ({
  store,
  canisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  canisterId: Principal;
  account: Account;
}): bigint | undefined => {
  const accountData = store[canisterId.toText()]?.[account.identifier];
  if (accountData === undefined) {
    return;
  }
  return accountData.transactions.sort((a, b) =>
    Number(a.transaction.timestamp - b.transaction.timestamp)
  )[0]?.id;
};
/**
 * Returns whether all transactions of an SNS account have been loaded.
 *
 * @param params
 * @param {Account} params.account
 * @param {UniverseCanisterId} params.canisterId
 * @param {IcrcTransactionsStoreData} params.store
 * @returns {boolean}
 */
export const isIcrcTransactionsCompleted = ({
  store,
  canisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  canisterId: UniverseCanisterId;
  account: Account;
}): boolean =>
  Boolean(store[canisterId.toText()]?.[account.identifier]?.completed);
