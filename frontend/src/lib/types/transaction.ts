import type { IcrcTransactionWithId } from "@dfinity/ledger";
import type { TokenAmount } from "@dfinity/nns";
import type { Account } from "./account";

export type NewTransaction = {
  sourceAccount: Account;
  destinationAddress: string;
  amount: number;
};

export interface TransactionInit {
  sourceAccount?: Account;
  destinationAddress?: string;
  /**
   * e.g. ckBTC transactions can either happen on the IC (ckBTC -> ckBTC) or on the IC and Bitcoin Network (ckBTC -> BTC)
   */
  mustSelectNetwork?: boolean;
  /**
   * e.g. when a conversion of ckBTC -> BTC resulted in some funds stuck in the withdrawal account, the user might try to restart the conversion. In that case, only the Bitcoin Network will be targeted.
   */
  networkReadonly?: boolean;
  amount?: number;
  /**
   * Generally user can use either one of the accounts or enter a manual address (see dedicated component for more rules).
   * However, it is possible that for some use case we might want to display either the input field or the dropdown - i.e. one method or the other.
   * This is the case when user restarts the ckBTC -> BTC conversion in which only manual address can be used.
   */
  selectDestinationMethods?: TransactionSelectDestinationMethods;
}

export type ValidateAmountFn = (params: {
  amount: number | undefined;
  selectedAccount: Account | undefined;
}) => string | undefined;

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
  ICP = "network_icp",
  BTC_MAINNET = "network_btc_mainnet",
  BTC_TESTNET = "network_btc_testnet",
}

export type TransactionSelectDestinationMethods = "all" | "manual" | "dropdown";
