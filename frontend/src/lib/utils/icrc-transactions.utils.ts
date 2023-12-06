import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type {
  IcrcTransactionData,
  IcrcTransactionInfo,
  UiTransaction,
} from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import type { UniverseCanisterId } from "$lib/types/universe";
import { transactionName } from "$lib/utils/transactions.utils";
import { Cbor } from "@dfinity/agent";
import type { PendingUtxo } from "@dfinity/ckbtc";
import type {
  IcrcTransaction,
  IcrcTransactionWithId,
} from "@dfinity/ledger-icrc";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import {
  TokenAmount,
  TokenAmountV2,
  fromNullable,
  isNullish,
  nonNullish,
  uint8ArrayToHexString,
  type Token,
} from "@dfinity/utils";

const isToSelf = (transaction: IcrcTransaction): boolean => {
  if (transaction.transfer.length !== 1) {
    return false;
  }
  const { from, to } = transaction.transfer[0];
  if (from.owner.toText() !== to.owner.toText()) {
    return false;
  }
  const fromSub = fromNullable(from.subaccount);
  const toSub = fromNullable(to.subaccount);
  if (isNullish(fromSub)) {
    return isNullish(toSub);
  }
  return (
    nonNullish(toSub) &&
    uint8ArrayToHexString(new Uint8Array(fromSub)) ===
      uint8ArrayToHexString(new Uint8Array(toSub))
  );
};

/**
 * Duplicates transactions made from and to the same account such that one of
 * the transactions has toSelfTransaction set to true and the other to false.
 */
const mapToSelfTransactions = (
  transactions: IcrcTransactionWithId[]
): { transaction: IcrcTransactionWithId; toSelfTransaction: boolean }[] => {
  const resultTransactions = transactions.flatMap((transaction) => {
    const tx = {
      transaction: { ...transaction },
      toSelfTransaction: false,
    };
    if (isToSelf(transaction.transaction)) {
      return [{ ...tx, toSelfTransaction: true }, tx];
    }
    return [tx];
  });
  return resultTransactions;
};

/**
 * Returns transactions of an ICRC-1 account sorted by date (newest first).
 * Duplicates transactions made from and to the same account such that one of
 * the transactions has toSelfTransaction set to true and the other to false.
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
  mapToSelfTransactions(
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
  if (fromNullable(transaction.approve) !== undefined) {
    return AccountTransactionType.Approve;
  }
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
    fromNullable(transaction.approve) ??
    fromNullable(transaction.burn) ??
    fromNullable(transaction.mint) ??
    fromNullable(transaction.transfer);
  const isApprove = nonNullish(fromNullable(transaction.approve));
  // Edge case, a transaction will have either "burn", "mint" or "transfer" data.
  if (data === undefined) {
    throw new Error(`Unknown transaction type ${JSON.stringify(transaction)}`);
  }
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
    // For Approve transactions, the amount is the approved amount, not the
    // transacted amount.
    amount: isApprove ? 0n : data?.amount,
    fee: fromNullable("fee" in data ? data.fee : []),
  };
};

export const mapIcrcTransaction = ({
  transaction,
  account,
  toSelfTransaction,
  governanceCanisterId,
  token,
  i18n,
}: {
  transaction: IcrcTransactionWithId;
  account: Account;
  toSelfTransaction: boolean;
  governanceCanisterId?: Principal;
  token: Token | undefined;
  i18n: I18n;
}): UiTransaction | undefined => {
  try {
    if (isNullish(token)) {
      return undefined;
    }

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
    const useFee = !isReceive;
    const feeApplied =
      useFee && txInfo.fee !== undefined ? txInfo.fee : BigInt(0);

    const headline = transactionName({
      type,
      isReceive,
      labels: i18n.transaction_names,
    });
    const otherParty = isReceive ? txInfo.from : txInfo.to;

    // Timestamp is in nano seconds
    const timestampMilliseconds =
      Number(transaction.transaction.timestamp) / NANO_SECONDS_IN_MILLISECOND;
    return {
      domKey: `${transaction.id}-${toSelfTransaction ? "0" : "1"}`,
      isIncoming: isReceive,
      isPending: false,
      headline,
      otherParty,
      tokenAmount: TokenAmountV2.fromUlps({
        amount: txInfo.amount + feeApplied,
        token,
      }),
      timestamp: new Date(timestampMilliseconds),
    };
  } catch (err) {
    toastsError({
      labelKey: "error.transaction_data",
      substitutions: { $txId: String(transaction.id) },
      err,
    });
  }
};

export type MapIcrcTransactionType = typeof mapIcrcTransaction;

// The memo will decode to: [0, [ withdrawalAddress, kytFee, status]]
type CkbtcBurnMemo = [0, [string, number, number | null | undefined]];

// Note: Transaction are expected to be mapped in reverse chronological order.
// Some transactions might merge themselves into previous transactions, because
// they are conceptually part of the same event, so it's important that they
// appear in the expected order.
export const mapCkbtcTransaction = (params: {
  transaction: IcrcTransactionWithId;
  prevTransaction?: IcrcTransactionWithId;
  prevUiTransaction?: UiTransaction;
  account: Account;
  toSelfTransaction: boolean;
  governanceCanisterId?: Principal;
  token: Token | undefined;
  i18n: I18n;
}): UiTransaction | undefined => {
  const mappedTransaction = mapIcrcTransaction(params);
  if (isNullish(mappedTransaction)) {
    return mappedTransaction;
  }
  const {
    i18n,
    transaction: { transaction },
  } = params;
  if (transaction.mint.length === 1) {
    mappedTransaction.otherParty = i18n.ckbtc.btc_network;
  } else if (transaction.burn.length === 1) {
    const memo = transaction.burn[0].memo[0] as Uint8Array;
    try {
      const decodedMemo = Cbor.decode(memo) as CkbtcBurnMemo;
      const withdrawalAddress = decodedMemo[1][0];
      mappedTransaction.otherParty = withdrawalAddress;
    } catch (err) {
      console.error("Failed to decode ckBTC burn memo", memo, err);
      mappedTransaction.otherParty = i18n.ckbtc.btc_network;
    }
  } else if (transaction.approve.length === 1) {
    const { prevTransaction, prevUiTransaction } = params;
    if (
      transaction.approve[0].fee.length === 1 &&
      prevTransaction?.transaction.burn.length === 1 &&
      prevUiTransaction?.tokenAmount instanceof TokenAmountV2
    ) {
      prevUiTransaction.tokenAmount = TokenAmountV2.fromUlps({
        amount:
          prevUiTransaction.tokenAmount.toUlps() +
          transaction.approve[0].fee[0],
        token: prevUiTransaction.tokenAmount.token,
      });
      return undefined;
    }
  }
  return mappedTransaction;
};

export const mapCkbtcPendingUtxo = ({
  utxo,
  token,
  kytFee,
  i18n,
}: {
  utxo: PendingUtxo;
  token: Token;
  kytFee: bigint;
  i18n: I18n;
}): UiTransaction => {
  return {
    domKey: `${uint8ArrayToHexString(Uint8Array.from(utxo.outpoint.txid))}-${
      utxo.outpoint.vout
    }`,
    isIncoming: true,
    isPending: true,
    headline: i18n.ckbtc.receiving_btc,
    otherParty: i18n.ckbtc.btc_network,
    tokenAmount: TokenAmount.fromE8s({
      amount: utxo.value - kytFee,
      token: token,
    }),
  };
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

/**
 * Dedupe transactions based on ID.
 */
export const getUniqueTransactions = (
  transactions: IcrcTransactionWithId[]
): IcrcTransactionWithId[] => {
  const txIds = new Set<bigint>();
  const result: IcrcTransactionWithId[] = [];
  for (const tx of transactions) {
    if (!txIds.has(tx.id)) {
      txIds.add(tx.id);
      result.push(tx);
    }
  }
  return result;
};
