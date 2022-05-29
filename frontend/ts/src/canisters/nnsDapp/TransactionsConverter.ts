import { UnsupportedValueError } from "../../utils";
import { Transaction, TransactionType, Transfer } from "./model";
import {
  Transaction as RawTransaction,
  TransactionType as RawTransactionType,
  Transfer as RawTransfer,
} from "./rawService";

export default class TransactionsConverter {
  public static convert = (
    transactions: Array<RawTransaction>
  ): Array<Transaction> => {
    return transactions.map(TransactionsConverter.toTransaction);
  };

  private static toTransaction = (transaction: RawTransaction): Transaction => {
    const type = transaction.transaction_type.length
      ? TransactionsConverter.toTransactionType(transaction.transaction_type[0])
      : TransactionsConverter.getBaseTransactionType(transaction);

    const transfer = TransactionsConverter.toTransfer(transaction.transfer);

    return {
      type,
      timestamp: transaction.timestamp.timestamp_nanos,
      blockHeight: transaction.block_height,
      memo: transaction.memo,
      transfer,
    };
  };

  private static toTransfer = (transfer: RawTransfer): Transfer => {
    if ("Burn" in transfer) {
      return {
        Burn: {
          amount: transfer.Burn.amount.e8s,
        },
      };
    } else if ("Mint" in transfer) {
      return {
        Mint: {
          amount: transfer.Mint.amount.e8s,
        },
      };
    } else if ("Receive" in transfer) {
      return {
        Receive: {
          from: transfer.Receive.from,
          amount: transfer.Receive.amount.e8s,
          fee: transfer.Receive.fee.e8s,
        },
      };
    } else if ("Send" in transfer) {
      return {
        Send: {
          to: transfer.Send.to,
          amount: transfer.Send.amount.e8s,
          fee: transfer.Send.fee.e8s,
        },
      };
    }

    // If there's a case missing, this line will cause a compiler error.
    throw new UnsupportedValueError(transfer);
  };

  private static toTransactionType = (
    transactionType: RawTransactionType
  ): TransactionType => {
    if ("Transfer" in transactionType) {
      return TransactionType.Send;
    } else if ("StakeNeuron" in transactionType) {
      return TransactionType.StakeNeuron;
    } else if ("StakeNeuronNotification" in transactionType) {
      return TransactionType.StakeNeuronNotification;
    } else if ("TopUpNeuron" in transactionType) {
      return TransactionType.TopUpNeuron;
    } else if ("CreateCanister" in transactionType) {
      return TransactionType.CreateCanister;
    } else if ("TopUpCanister" in transactionType) {
      return TransactionType.TopUpCanister;
    } else if ("Burn" in transactionType) {
      return TransactionType.Burn;
    } else if ("Mint" in transactionType) {
      return TransactionType.Mint;
    }

    // If there's a case missing, this line will cause a compiler error.
    throw new UnsupportedValueError(transactionType);
  };

  // This should never be hit since people running the latest front end code should have had their principal stored in
  // the NNS UI canister and therefore will have all of their transaction types set.
  private static getBaseTransactionType = (
    transaction: RawTransaction
  ): TransactionType => {
    if ("Burn" in transaction) {
      return TransactionType.Burn;
    } else if ("Mint" in transaction) {
      return TransactionType.Mint;
    } else {
      return TransactionType.Send;
    }
  };
}
