import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  AccountTransactionType,
  TransactionNetwork,
} from "$lib/types/transaction";
import { isNullish } from "@dfinity/utils";
import { stringifyJson } from "./utils";

export const transactionDisplayAmount = ({
  useFee,
  amount,
  fee,
}: {
  useFee: boolean;
  amount: bigint;
  fee: bigint | undefined;
}): bigint => {
  if (useFee) {
    if (isNullish(fee)) {
      throw new Error("fee is not available");
    }
    return amount + fee;
  }
  return amount;
};

/**
 * Note: We used to display the token symbol within the transaction labels that is why this function uses replacePlaceholders.
 * Although it was decided to not render such symbol anymore, we keep the code as it in case this would change in the future.
 */
export const transactionName = ({
  type,
  isReceive,
  i18n,
}: {
  type: AccountTransactionType;
  isReceive: boolean;
  i18n: I18n;
}): string => {
  switch (type) {
    case AccountTransactionType.Send:
      return isReceive
        ? i18n.transaction_names.receive
        : i18n.transaction_names.send;
    case AccountTransactionType.Approve:
      return i18n.transaction_names.approve;
    case AccountTransactionType.Burn:
      return i18n.transaction_names.burn;
    case AccountTransactionType.Mint:
      return i18n.transaction_names.mint;
    case AccountTransactionType.StakeNeuron:
      return i18n.transaction_names.stakeNeuron;
    case AccountTransactionType.StakeNeuronNotification:
      return i18n.transaction_names.stakeNeuronNotification;
    case AccountTransactionType.TopUpNeuron:
      return i18n.transaction_names.topUpNeuron;
    case AccountTransactionType.CreateCanister:
      return i18n.transaction_names.createCanister;
    case AccountTransactionType.TopUpCanister:
      return i18n.transaction_names.topUpCanister;
    case AccountTransactionType.ParticipateSwap:
      return i18n.transaction_names.participateSwap;
    case AccountTransactionType.RefundSwap:
      return i18n.transaction_names.refundSwap;
  }
  return type;
};

/** (from==to workaround) Set `mapToSelfNnsTransaction: true` when sender and receiver are the same account (e.g. transmitting from `main` to `main` account) */
export const mapToSelfTransaction = (
  transactions: NnsTransaction[]
): { transaction: NnsTransaction; toSelfTransaction: boolean }[] => {
  const resultTransactions = transactions.map((transaction) => ({
    transaction: { ...transaction },
    toSelfTransaction: false,
  }));

  // We rely on self transactions to be one next to each other.
  // We only set the first transaction to `toSelfTransaction: true`
  // because the second one will be `toSelfTransaction: false` and it will be displayed as `Sent` transaction.
  for (let i = 0; i < resultTransactions.length - 1; i++) {
    const { transaction } = resultTransactions[i];
    const { transaction: nextTransaction } = resultTransactions[i + 1];

    if (stringifyJson(transaction) === stringifyJson(nextTransaction)) {
      resultTransactions[i].toSelfTransaction = true;
    }
  }

  return resultTransactions;
};

export const isTransactionNetworkBtc = (
  network: TransactionNetwork | undefined
): boolean =>
  TransactionNetwork.BTC_MAINNET === network ||
  TransactionNetwork.BTC_TESTNET === network;

/**
 * Dedupe transactions based on ID.
 */
export const getUniqueTransactions = <TransactionWithId extends { id: bigint }>(
  transactions: TransactionWithId[]
): TransactionWithId[] => {
  const txIds = new Set<bigint>();
  const result: TransactionWithId[] = [];
  for (const tx of transactions) {
    if (!txIds.has(tx.id)) {
      txIds.add(tx.id);
      result.push(tx);
    }
  }
  return result;
};
