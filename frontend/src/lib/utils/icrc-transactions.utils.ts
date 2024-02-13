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
import type {
  PendingUtxo,
  RetrieveBtcStatusV2,
  RetrieveBtcStatusV2WithId,
} from "@dfinity/ckbtc";
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
    const feeApplied = useFee && txInfo.fee !== undefined ? txInfo.fee : 0n;

    const headline = transactionName({
      type,
      isReceive,
      i18n,
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

const MINT_TYPE_KYT_FAIL = 2;

// The memo will decode to either:
// * Convert: [0, [ tx_id, vout, kyt_fee]]
// * KytFail: [2, [ kyt_fee, kyt_status, block_index]]
// Source: https://github.com/dfinity/ic/blob/c22a5aebd4f26ae2e4016de55e3f7aa00d086479/rs/bitcoin/ckbtc/minter/src/memo.rs#L25
type CkbtcMintMemo =
  | [0, [Uint8Array?, number?, number?]]
  | [2, [number, number?, number?]];

const isCkbtcReimbursementMintMemo = (
  memo: Uint8Array | number[] | undefined
) => {
  // Legacy minting transaction have a memo of length 0 or 32.
  // We ignore them.
  if (isNullish(memo) || memo.length === 0 || memo.length === 32) {
    return false;
  }
  try {
    const decodedMemo = Cbor.decode(new Uint8Array(memo)) as CkbtcMintMemo;
    const mintType = decodedMemo[0];
    return mintType === MINT_TYPE_KYT_FAIL;
  } catch (err) {
    console.error("Failed to decode ckBTC mint memo", memo, err);
    return false;
  }
};

export const mapCkbtcTransaction = (params: {
  transaction: IcrcTransactionWithId;
  account: Account;
  toSelfTransaction: boolean;
  governanceCanisterId?: Principal;
  token: Token | undefined;
  i18n: I18n;
  retrieveBtcStatus?: RetrieveBtcStatusV2;
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
    const memo = transaction.mint[0].memo[0];
    mappedTransaction.otherParty = i18n.ckbtc.btc_network;
    if (isCkbtcReimbursementMintMemo(memo)) {
      mappedTransaction.headline = i18n.ckbtc.reimbursement;
      mappedTransaction.isReimbursement = true;
    } else {
      mappedTransaction.headline = i18n.ckbtc.btc_received;
    }
  } else if (transaction.burn.length === 1) {
    mappedTransaction.headline = i18n.ckbtc.btc_sent;
    const status = params.retrieveBtcStatus;
    if (status) {
      if ("Reimbursed" in status || "AmmountTooLow" in status) {
        mappedTransaction.headline = i18n.ckbtc.sending_btc_failed;
        mappedTransaction.isFailed = true;
      } else if (
        "Pending" in status ||
        "Signing" in status ||
        "Sending" in status ||
        "Submitted" in status ||
        "WillReimburse" in status
      ) {
        mappedTransaction.headline = i18n.ckbtc.sending_btc;
        mappedTransaction.isPending = true;
      } else if (!("Confirmed" in status)) {
        console.error("Unknown retrieveBtcStatusV2:", status);
        // Leave the transaction as "Sent".
      }
    }
    const memo = transaction.burn[0].memo[0] as Uint8Array;
    try {
      const decodedMemo = Cbor.decode(memo) as CkbtcBurnMemo;
      const withdrawalAddress = decodedMemo[1][0];
      mappedTransaction.otherParty = withdrawalAddress;
    } catch (err) {
      console.error("Failed to decode ckBTC burn memo", memo, err);
      mappedTransaction.otherParty = i18n.ckbtc.btc_network;
    }
  }
  return mappedTransaction;
};

// Note: Transaction are expected to be mapped in reverse chronological order.
// Some transactions might merge themselves into previous transactions, because
// they are conceptually part of the same event, so it's important that they
// appear in the expected order.
export const mapCkbtcTransactions = ({
  transactionData,
  account,
  token,
  i18n,
  retrieveBtcStatuses,
}: {
  transactionData: IcrcTransactionData[];
  account: Account;
  token: Token | undefined;
  i18n: I18n;
  retrieveBtcStatuses: RetrieveBtcStatusV2WithId[];
}): UiTransaction[] => {
  let prevTransaction: IcrcTransactionWithId | undefined = undefined;
  let prevUiTransaction: UiTransaction | undefined = undefined;
  const statusById = new Map<bigint, RetrieveBtcStatusV2>();
  for (const { id, status } of retrieveBtcStatuses) {
    if (status) {
      statusById.set(id, status);
    }
  }
  return transactionData
    .map(({ transaction, toSelfTransaction }: IcrcTransactionData) => {
      if (
        transaction.transaction.approve.length === 1 &&
        transaction.transaction.approve[0].fee.length === 1 &&
        prevTransaction?.transaction.burn.length === 1 &&
        prevUiTransaction?.tokenAmount instanceof TokenAmountV2
      ) {
        prevUiTransaction.tokenAmount = TokenAmountV2.fromUlps({
          amount:
            prevUiTransaction.tokenAmount.toUlps() +
            transaction.transaction.approve[0].fee[0],
          token: prevUiTransaction.tokenAmount.token,
        });
        prevTransaction = transaction;
        return undefined;
      }
      const uiTransaction = mapCkbtcTransaction({
        transaction,
        toSelfTransaction,
        account,
        token,
        i18n,
        retrieveBtcStatus: statusById.get(transaction.id),
      });
      prevTransaction = transaction;
      prevUiTransaction = uiTransaction;
      return uiTransaction;
    })
    .filter(nonNullish);
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
  ledgerCanisterId,
  account,
}: {
  store: IcrcTransactionsStoreData;
  ledgerCanisterId: Principal;
  account: Account;
}): bigint | undefined => {
  const accountData = store[ledgerCanisterId.toText()]?.[account.identifier];
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
