import type {
  AccountIdentifierString,
  Transaction as NnsTransaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Account } from "$lib/types/account";
import type { Transaction } from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { replacePlaceholders } from "./i18n.utils";
import { stringifyJson } from "./utils";

export const transactionType = (
  transaction: NnsTransaction
): AccountTransactionType => {
  const { transaction_type } = transaction;
  if (transaction_type.length === 0) {
    // This should never be hit since people running the latest front end code should have had their principal stored in
    // the NNS UI canister and therefore will have all of their transaction types set.
    if ("Burn" in transaction) {
      return AccountTransactionType.Burn;
    } else if ("Mint" in transaction) {
      return AccountTransactionType.Mint;
    }
    return AccountTransactionType.Send;
  }

  if ("Transfer" in transaction_type[0]) {
    return AccountTransactionType.Send;
  } else if ("StakeNeuron" in transaction_type[0]) {
    return AccountTransactionType.StakeNeuron;
  } else if ("StakeNeuronNotification" in transaction_type[0]) {
    return AccountTransactionType.StakeNeuronNotification;
  } else if ("TopUpNeuron" in transaction_type[0]) {
    return AccountTransactionType.TopUpNeuron;
  } else if ("CreateCanister" in transaction_type[0]) {
    return AccountTransactionType.CreateCanister;
  } else if ("TopUpCanister" in transaction_type[0]) {
    return AccountTransactionType.TopUpCanister;
  } else if ("Burn" in transaction_type[0]) {
    return AccountTransactionType.Burn;
  } else if ("Mint" in transaction_type[0]) {
    return AccountTransactionType.Mint;
  } else if ("ParticipateSwap" in transaction_type[0]) {
    return AccountTransactionType.ParticipateSwap;
  }

  throw new Error(
    "Unknown TransactionType: " + JSON.stringify(transactionType)
  );
};

export const showTransactionFee = ({
  type,
  isReceive,
}: {
  type: AccountTransactionType;
  isReceive: boolean;
}): boolean => {
  if (isReceive) {
    return false;
  }
  switch (type) {
    case AccountTransactionType.Mint:
    case AccountTransactionType.Burn:
      return false;
    default:
      return true;
  }
};

export const transactionDisplayAmount = ({
  useFee,
  amount,
  fee,
}: {
  useFee: boolean;
  amount: TokenAmount;
  fee: TokenAmount | undefined;
}): TokenAmount => {
  if (useFee) {
    if (fee === undefined) {
      throw new Error("fee is not available");
    }
    return TokenAmount.fromE8s({
      amount: amount.toE8s() + fee.toE8s(),
      token: amount.token,
    });
  }
  return amount;
};

export const mapNnsTransaction = ({
  transaction,
  account,
  toSelfTransaction,
}: {
  transaction: NnsTransaction;
  account: Account;
  toSelfTransaction?: boolean;
}): Transaction => {
  const { transfer, timestamp } = transaction;
  let from: AccountIdentifierString | undefined;
  let to: AccountIdentifierString | undefined;
  let amount: TokenAmount | undefined;
  let fee: TokenAmount | undefined;

  if ("Send" in transfer) {
    from = account.identifier;
    to = transfer.Send.to;
    amount = TokenAmount.fromE8s({
      amount: transfer.Send.amount.e8s,
      token: ICPToken,
    });
    fee = TokenAmount.fromE8s({
      amount: transfer.Send.fee.e8s,
      token: ICPToken,
    });
  } else if ("Receive" in transfer) {
    to = account.identifier;
    from = transfer.Receive.from;
    amount = TokenAmount.fromE8s({
      amount: transfer.Receive.amount.e8s,
      token: ICPToken,
    });
    fee = TokenAmount.fromE8s({
      amount: transfer.Receive.fee.e8s,
      token: ICPToken,
    });
  } else if ("Burn" in transfer) {
    amount = TokenAmount.fromE8s({
      amount: transfer.Burn.amount.e8s,
      token: ICPToken,
    });
  } else if ("Mint" in transfer) {
    amount = TokenAmount.fromE8s({
      amount: transfer.Mint.amount.e8s,
      token: ICPToken,
    });
  } else {
    throw new Error("Unsupported transfer type");
  }

  const type = transactionType(transaction);
  const date = new Date(Number(timestamp.timestamp_nanos / BigInt(1e6)));
  const isReceive = toSelfTransaction === true || from !== account.identifier;
  const isSend = to !== account.identifier;
  // (from==to workaround) in case of transaction duplication we replace one of the transaction to `Received`, and it doesn't need to show fee because paid fee is already shown in the `Send` one.
  const useFee =
    toSelfTransaction === true
      ? false
      : showTransactionFee({ type, isReceive });
  const displayAmount = transactionDisplayAmount({ useFee, amount, fee });

  return {
    isReceive,
    isSend,
    type,
    from,
    to,
    displayAmount,
    date,
  };
};

export const transactionName = ({
  type,
  isReceive,
  labels,
  tokenSymbol,
}: {
  type: AccountTransactionType;
  isReceive: boolean;
  labels: I18nTransaction_names;
  tokenSymbol: string;
}): string =>
  replacePlaceholders(
    type === AccountTransactionType.Send
      ? isReceive
        ? labels.receive
        : labels.send
      : labels[type] ?? type,
    { $tokenSymbol: tokenSymbol }
  );

/** (from==to workaround) Set `mapToSelfNnsTransaction: true` when sender and receiver are the same account (e.g. transmitting from `main` to `main` account) */
export const mapToSelfTransaction = <T>(
  transactions: T[]
): { transaction: T; toSelfTransaction: boolean }[] => {
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
