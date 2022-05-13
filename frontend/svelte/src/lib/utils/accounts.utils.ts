import { ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  AccountIdentifierString,
  Transaction,
} from "../canisters/nns-dapp/nns-dapp.types";
import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../constants/accounts.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";

/*
 * Returns the principal's main or hardware account
 *
 * Subaccounts do not have Principal
 */
export const getAccountByPrincipal = ({
  principal,
  accounts,
}: {
  principal: string;
  accounts: AccountsStore;
}): Account | undefined => {
  if (accounts.main?.principal?.toText() === principal) {
    return accounts.main;
  }

  // TODO: Check also the hardware wallets L2-433
  return undefined;
};

/**
 * Is the address a valid entry to proceed with any action such as transferring ICP?
 */
export const invalidAddress = (address: string | undefined): boolean =>
  address === undefined || address.length < ACCOUNT_ADDRESS_MIN_LENGTH;

/**
 * Is the address an empty value? Useful to detect if user is currently entering an address regardless if valid or invalid
 */
export const emptyAddress = (address: string | undefined): boolean =>
  address === undefined || address.length === 0;

/**
 * Converts address string to Principal.
 * @param address
 * @returns Principal or `undefined` when not valid
 */
export const getPrincipalFromString = (
  address: string
): Principal | undefined => {
  try {
    return Principal.fromText(address);
  } catch (_) {
    return undefined;
  }
};

export enum AccountTransactionType {
  Burn = "burn",
  Mint = "mint",
  Send = "send",
  StakeNeuron = "stakeNeuron",
  StakeNeuronNotification = "stakeNeuronNotification",
  TopUpNeuron = "topUpNeuron",
  CreateCanister = "createCanister",
  TopUpCanister = "topUpCanister",
}

// TODO: tests
export const accountName = ({
  account,
  mainName,
}: {
  account: Account;
  mainName: string;
}): string =>
  account.name ?? (account.type === "main" ? mainName : account.name ?? "");

export interface AccountTransaction {
  from: AccountIdentifierString;
  to: AccountIdentifierString;
  amount: ICP;
  date: Date;
  fee: ICP;
  type: AccountTransactionType;
  memo: bigint;
  incomplete: boolean;
  blockHeight: bigint;
}

export const transactionType = (
  transaction: Transaction
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

// TODO: tests
export const transactionDisplayAmount = ({
  type,
  isReceive,
  amount,
  fee,
}: {
  type: AccountTransactionType;
  isReceive: boolean;
  amount: ICP;
  fee: ICP | undefined;
}): ICP => {
  if (showTransactionFee({ type, isReceive })) {
    if (fee === undefined) {
      throw new Error("fee is not available");
    }
    return ICP.fromE8s(amount.toE8s() + fee.toE8s());
  }
  return amount;
};

// TODO: tests
export const mapTransaction = ({
  transaction,
  account,
}: {
  transaction: Transaction;
  account: Account;
}): {
  type: AccountTransactionType;
  isReceive: boolean;
  isSend: boolean;
  from: AccountIdentifierString | undefined;
  to: AccountIdentifierString | undefined;
  displayAmount: ICP;
  date: Date;
} => {
  const { transfer, timestamp } = transaction;
  let from: AccountIdentifierString | undefined;
  let to: AccountIdentifierString | undefined;
  let amount: ICP | undefined;
  let fee: ICP | undefined;

  if ("Send" in transfer) {
    from = account.identifier;
    to = transfer.Send.to;
    amount = ICP.fromE8s(transfer.Send.amount.e8s);
    fee = ICP.fromE8s(transfer.Send.fee.e8s);
  } else if ("Receive" in transfer) {
    to = account.identifier;
    from = transfer.Receive.from;
    amount = ICP.fromE8s(transfer.Receive.amount.e8s);
    fee = ICP.fromE8s(transfer.Receive.fee.e8s);
  } else if ("Burn" in transfer) {
    amount = ICP.fromE8s(transfer.Burn.amount.e8s);
  } else if ("Mint" in transfer) {
    amount = ICP.fromE8s(transfer.Mint.amount.e8s);
  } else {
    throw new Error("Unsupported transfer type");
  }

  const type = transactionType(transaction);
  const date = new Date(Number(timestamp.timestamp_nanos / BigInt(1e6)));
  const isReceive = from !== account.identifier;
  const isSend = to !== account.identifier;
  const displayAmount = transactionDisplayAmount({
    type,
    isReceive,
    amount,
    fee,
  });

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

export const isHardwareWallet = (account: Account | undefined): boolean =>
  account?.type === "hardwareWallet";
