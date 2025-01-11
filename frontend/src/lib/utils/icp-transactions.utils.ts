import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import { toastsError } from "$lib/stores/toasts.store";
import {
  AccountTransactionType,
  type UiTransaction,
} from "$lib/types/transaction";
import { transactionName } from "$lib/utils/transactions.utils";
import type {
  Operation,
  Transaction,
  TransactionWithId,
} from "@dfinity/ledger-icp";
import {
  ICPToken,
  TokenAmountV2,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";

const isToSelf = (transaction: Transaction): boolean => {
  if ("Transfer" in transaction.operation) {
    const data = transaction.operation.Transfer;
    return data.to === data.from;
  }
  return false;
};

/**
 * Duplicates transactions made from and to the same account such that one of
 * the transactions has toSelfTransaction set to true and the other to false.
 */
export const mapToSelfTransactions = (
  transactions: TransactionWithId[]
): { transaction: TransactionWithId; toSelfTransaction: boolean }[] => {
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

export const sortTransactionsByIdDescendingOrder = (
  transactions: TransactionWithId[]
): TransactionWithId[] => transactions.sort((a, b) => (a.id > b.id ? -1 : 1));

// TODO: Support icrc_memo which is not used at the moment in NNS dapp.
const getTransactionType = ({
  transaction: { operation, memo },
  neuronAccounts,
  swapCanisterAccounts,
  isReceive,
}: {
  transaction: Transaction;
  neuronAccounts: Set<string>;
  swapCanisterAccounts: Set<string>;
  isReceive: boolean;
}): AccountTransactionType => {
  if ("Burn" in operation) {
    return AccountTransactionType.Burn;
  }
  if ("Mint" in operation) {
    return AccountTransactionType.Mint;
  }
  if ("Approve" in operation) {
    return AccountTransactionType.Approve;
  }
  // "Transfer" in operation
  const data = operation.Transfer;
  if (swapCanisterAccounts.has(data.to)) {
    return AccountTransactionType.ParticipateSwap;
  }
  if (swapCanisterAccounts.has(data.from)) {
    return AccountTransactionType.RefundSwap;
  }
  if (memo === CREATE_CANISTER_MEMO) {
    return AccountTransactionType.CreateCanister;
  }
  if (memo === TOP_UP_CANISTER_MEMO) {
    return AccountTransactionType.TopUpCanister;
  }
  if (neuronAccounts.has(data.to)) {
    return memo > 0n
      ? AccountTransactionType.StakeNeuron
      : AccountTransactionType.TopUpNeuron;
  }

  // Send/Receive is the default transaction type
  if (isReceive) {
    return AccountTransactionType.Receive;
  }
  return AccountTransactionType.Send;
};

type IcpTransactionInfo = {
  to?: string;
  from?: string;
  amount: bigint;
  fee?: bigint;
};

const getTransactionInformation = (
  operation: Operation
): IcpTransactionInfo | undefined => {
  let data = undefined;
  if ("Approve" in operation) {
    data = operation.Approve;
  } else if ("Burn" in operation) {
    data = operation.Burn;
  } else if ("Mint" in operation) {
    data = operation.Mint;
  } else if ("Transfer" in operation) {
    data = operation.Transfer;
  }
  // Edge case, a transaction will have either "Approve", "Burn", "Mint" or "Transfer" data.
  if (isNullish(data)) return undefined;

  return {
    from: "from" in data ? data.from : undefined,
    to: "to" in data ? data.to : undefined,
    // The only type without `amount` is the Approve transaction.
    // For Approve transactions, the balance doesn't change, so we show amount 0.
    // This is different than ICRC transactions, where thers is an `amount` field.
    amount: "amount" in data ? data.amount.e8s : 0n,
    fee: "fee" in data ? data.fee.e8s : 0n,
  };
};

export const mapIcpTransactionToReport = ({
  transaction,
  accountIdentifier,
  neuronAccounts,
  swapCanisterAccounts,
}: {
  transaction: TransactionWithId;
  accountIdentifier: string;
  neuronAccounts: Set<string>;
  swapCanisterAccounts: Set<string>;
}) => {
  const txInfo = getTransactionInformation(transaction.transaction.operation);
  if (isNullish(txInfo)) {
    throw new Error(
      `Unknown transaction type "${
        Object.keys(transaction.transaction.operation)[0]
      }"`
    );
  }

  const { to, from, amount, fee } = txInfo;
  const isSelfTransaction = isToSelf(transaction.transaction);
  const isReceive = isSelfTransaction || from !== accountIdentifier;
  const transactionDirection: "credit" | "debit" = isReceive
    ? "credit"
    : "debit";

  const useFee = !isReceive;
  const feeApplied = useFee && fee ? fee : 0n;

  const type = getTransactionType({
    transaction: transaction.transaction,
    neuronAccounts,
    swapCanisterAccounts,
    isReceive,
  });

  const blockTimestampNanos = fromNullable(
    transaction.transaction.timestamp
  )?.timestamp_nanos;
  const createdTimestampNanos = fromNullable(
    transaction.transaction.created_at_time
  )?.timestamp_nanos;
  const timestampNanos = blockTimestampNanos ?? createdTimestampNanos;

  const tokenAmount = TokenAmountV2.fromUlps({
    amount: amount + feeApplied,
    token: ICPToken,
  });

  return {
    type,
    to,
    from,
    tokenAmount,
    timestampNanos,
    transactionDirection,
  };
};

export const mapIcpTransactionToUi = ({
  transaction,
  accountIdentifier,
  toSelfTransaction,
  neuronAccounts,
  swapCanisterAccounts,
  i18n,
}: {
  transaction: TransactionWithId;
  accountIdentifier: string;
  toSelfTransaction: boolean;
  neuronAccounts: Set<string>;
  swapCanisterAccounts: Set<string>;
  i18n: I18n;
}): UiTransaction | undefined => {
  try {
    const txInfo = getTransactionInformation(transaction.transaction.operation);
    if (isNullish(txInfo)) {
      throw new Error(
        `Unknown transaction type "${
          Object.keys(transaction.transaction.operation)[0]
        }"`
      );
    }
    const isReceive =
      toSelfTransaction === true || txInfo.from !== accountIdentifier;
    const useFee = !isReceive;
    const feeApplied = useFee && txInfo.fee !== undefined ? txInfo.fee : 0n;

    const type = getTransactionType({
      transaction: transaction.transaction,
      neuronAccounts,
      swapCanisterAccounts,
      isReceive,
    });

    const headline = transactionName({
      type,
      i18n,
    });
    const otherParty = isReceive ? txInfo.from : txInfo.to;

    const blockTimestampNanos = fromNullable(
      transaction.transaction.timestamp
    )?.timestamp_nanos;

    const createdTimestampNanos = fromNullable(
      transaction.transaction.created_at_time
    )?.timestamp_nanos;
    const timestampNanos = blockTimestampNanos ?? createdTimestampNanos;
    const timestampMilliseconds = nonNullish(timestampNanos)
      ? Number(timestampNanos) / NANO_SECONDS_IN_MILLISECOND
      : undefined;
    const timestamp = nonNullish(timestampMilliseconds)
      ? new Date(timestampMilliseconds)
      : undefined;
    return {
      domKey: `${transaction.id}-${toSelfTransaction ? "0" : "1"}`,
      isIncoming: isReceive,
      isPending: false,
      headline,
      otherParty,
      tokenAmount: TokenAmountV2.fromUlps({
        amount: txInfo.amount + feeApplied,
        token: ICPToken,
      }),
      timestamp,
      isFailed: false,
      isReimbursement: false,
    };
  } catch (err) {
    toastsError({
      labelKey: "error.transaction_data",
      substitutions: { $txId: String(transaction.id) },
      err,
    });
  }
};
