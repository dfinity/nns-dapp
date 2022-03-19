import { Principal } from "@dfinity/principal";
import {
  AccountIdentifier,
  BlockHeight,
  CanisterIdString,
  E8s,
  Memo,
  NeuronId,
  PrincipalString,
} from "../common/types";
import { CanisterId } from "./rawService";

export enum TransactionType {
  Burn,
  Mint,
  Send,
  StakeNeuron,
  StakeNeuronNotification,
  TopUpNeuron,
  CreateCanister,
  TopUpCanister,
}

export interface AccountDetails {
  principal: PrincipalString;
  accountIdentifier: AccountIdentifier;
  hardwareWalletAccounts: Array<HardwareWalletAccountDetails>;
  subAccounts: Array<SubAccountDetails>;
}

export interface AttachCanisterRequest {
  name: string;
  canisterId: CanisterIdString;
}

export enum AttachCanisterResult {
  Ok,
  CanisterAlreadyAttached,
  NameAlreadyTaken,
  NameTooLong,
  CanisterLimitExceeded,
}

export interface CanisterDetails {
  name: string;
  canisterId: CanisterIdString;
}

export type CreateSubAccountResponse =
  | { Ok: SubAccountDetails }
  | { AccountNotFound: null }
  | { SubAccountLimitExceeded: null }
  | { NameTooLong: null };

export interface DetachCanisterRequest {
  canisterId: CanisterIdString;
}
export type DetachCanisterResponse = { Ok: null } | { CanisterNotFound: null };

export type GetAccountResponse =
  | { Ok: AccountDetails }
  | { AccountNotFound: null };

export interface GetTransactionsRequest {
  accountIdentifier: AccountIdentifier;
  pageSize: number;
  offset: number;
}
export interface GetTransactionsResponse {
  total: number;
  transactions: Array<Transaction>;
}
export interface HardwareWalletAccountDetails {
  name: string;
  principal: PrincipalString;
  accountIdentifier: AccountIdentifier;
}
export type MultiPartTransactionStatus =
  | { Queued: null }
  | { Error: string }
  | { Refunded: [BlockHeight, string] }
  | { CanisterCreated: CanisterId }
  | { Complete: null }
  | { NotFound: null }
  | { NeuronCreated: NeuronId }
  | { PendingSync: BlockHeight }
  | { ErrorWithRefundPending: string };
export interface Receive {
  fee: E8s;
  from: AccountIdentifier;
  amount: E8s;
}
export interface RegisterHardwareWalletRequest {
  name: string;
  principal: PrincipalString;
}
export type RegisterHardwareWalletResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { HardwareWalletAlreadyRegistered: null }
  | { HardwareWalletLimitExceeded: null }
  | { NameTooLong: null };
export interface RenameSubAccountRequest {
  newName: string;
  accountIdentifier: AccountIdentifier;
}
export type RenameSubAccountResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { SubAccountNotFound: null }
  | { NameTooLong: null };

export interface Send {
  to: AccountIdentifier;
  fee: E8s;
  amount: E8s;
}
export type SubAccount = Array<number>;
export interface SubAccountDetails {
  id: number;
  name: string;
  accountIdentifier: AccountIdentifier;
}
export type TimestampNanos = bigint;
export interface Transaction {
  type: TransactionType;
  timestamp: TimestampNanos;
  blockHeight: BlockHeight;
  memo: Memo;
  transfer: Transfer;
}
export type Transfer =
  | { Burn: { amount: E8s } }
  | { Mint: { amount: E8s } }
  | { Send: Send }
  | { Receive: Receive };

export default interface ServiceInterface {
  addAccount: () => Promise<AccountIdentifier>;
  attachCanister: (
    request: AttachCanisterRequest
  ) => Promise<AttachCanisterResult>;
  createSubAccount: (name: string) => Promise<CreateSubAccountResponse>;
  detachCanister: (
    request: DetachCanisterRequest
  ) => Promise<DetachCanisterResponse>;
  getAccount: (certified: boolean) => Promise<GetAccountResponse>;
  getCanisters: () => Promise<Array<CanisterDetails>>;
  getMultiPartTransactionStatus: (
    principal: Principal,
    blockHeight: BlockHeight
  ) => Promise<MultiPartTransactionStatus>;
  getTransactions: (
    request: GetTransactionsRequest,
    certified: boolean
  ) => Promise<GetTransactionsResponse>;
  registerHardwareWallet: (
    request: RegisterHardwareWalletRequest
  ) => Promise<RegisterHardwareWalletResponse>;
  renameSubAccount: (
    request: RenameSubAccountRequest
  ) => Promise<RenameSubAccountResponse>;
}
