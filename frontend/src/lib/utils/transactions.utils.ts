import {
  AccountTransactionType,
  TransactionNetwork,
} from "$lib/types/transaction";
import { isNullish, nonNullish } from "@dfinity/utils";
import { invalidIcpAddress, invalidIcrcAddress } from "./accounts.utils";

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
  i18n,
}: {
  type: AccountTransactionType;
  i18n: I18n;
}): string => {
  switch (type) {
    case AccountTransactionType.Send:
      return i18n.transaction_names.send;
    case AccountTransactionType.Receive:
      return i18n.transaction_names.receive;
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

// it should only contain numbers and limit to 64bits
export const isValidIcpMemo = (memo: string): boolean => {
  if (!/^\d+$/.test(memo)) return false;

  try {
    const UINT64_MAX = 2n ** 64n - 1n;
    const memoBigInt = BigInt(memo);
    return memoBigInt >= 0n && memoBigInt <= UINT64_MAX;
  } catch {
    return false;
  }
};

// it should be less than 32 bytes when encoded as UTF-8
export const isValidIcrc1Memo = (memo: string): boolean => {
  try {
    return new TextEncoder().encode(memo).length <= 32;
  } catch {
    return false;
  }
};

export const validateTransactionMemo = ({
  memo,
  destinationAddress,
}: {
  memo: string;
  destinationAddress: string;
}): "ICP_MEMO_ERROR" | "ICRC_MEMO_ERROR" | undefined => {
  const isValidIcpAddress = !invalidIcpAddress(destinationAddress);
  if (nonNullish(memo) && isValidIcpAddress && !isValidIcpMemo(memo)) {
    return "ICP_MEMO_ERROR";
  }

  const isValidIcrcAddress = !invalidIcrcAddress(destinationAddress);
  if (nonNullish(memo) && isValidIcrcAddress && !isValidIcrc1Memo(memo)) {
    return "ICRC_MEMO_ERROR";
  }
};
