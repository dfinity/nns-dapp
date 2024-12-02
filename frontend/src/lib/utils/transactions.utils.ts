import {
  AccountTransactionType,
  TransactionNetwork,
} from "$lib/types/transaction";
import { isNullish } from "@dfinity/utils";

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
