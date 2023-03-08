import type { IcrcTransactionWithId } from "@dfinity/ledger";
import type { TokenAmount } from "@dfinity/nns";
import type { Account } from "./account";

export type NewTransaction = {
  sourceAccount: Account;
  destinationAddress: string;
  amount: number;
};

export type ValidateAmountFn = (
  amount: number | undefined
) => string | undefined;

export interface IcrcTransactionData {
  toSelfTransaction: boolean;
  transaction: IcrcTransactionWithId;
}

export interface IcrcTransactionInfo {
  to?: string;
  from?: string;
  memo?: Uint8Array;
  created_at_time?: bigint;
  amount: bigint;
  fee?: bigint;
}

// Value should match the key in i18n "transaction_names"
export enum AccountTransactionType {
  Burn = "burn",
  Mint = "mint",
  Send = "send",
  StakeNeuron = "stakeNeuron",
  StakeNeuronNotification = "stakeNeuronNotification",
  TopUpNeuron = "topUpNeuron",
  CreateCanister = "createCanister",
  TopUpCanister = "topUpCanister",
  ParticipateSwap = "participateSwap",
}

export interface Transaction {
  type: AccountTransactionType;
  isReceive: boolean;
  isSend: boolean;
  // Account string representation
  from: string | undefined;
  // Account string representation
  to: string | undefined;
  displayAmount: TokenAmount;
  date: Date;
}

export enum TransactionNetwork {
  ICP_CKBTC = "network_icp_ckbtc",
  ICP_CKTESTBTC = "network_icp_cktestbtc",
  BTC_MAINNET = "network_btc_mainnet",
  BTC_TESTNET = "network_btc_testnet",
}
