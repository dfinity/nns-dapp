import { Principal } from "@dfinity/agent";
import { AccountIdentifier, BlockHeight, CanisterId, E8s } from "../common/types";

export type Memo = bigint;
export enum TransactionType {
    Send,
    Receive,
    Mint,
    Burn,
    StakeNeuron,
    StakeNeuronNotification,
    CreateCanister,
    CreateCanisterNotification,
    TopUpCanister,
    TopUpCanisterNotification
}

export interface AccountDetails {
    accountIdentifier: AccountIdentifier,
    hardwareWalletAccounts: Array<HardwareWalletAccountDetails>,
    subAccounts: Array<SubAccountDetails>,
}

export interface AttachCanisterRequest {
    name: string,
    canisterId: CanisterId      
}

export enum AttachCanisterResult {
    Ok,
    CanisterAlreadyAttached,
    NameAlreadyTaken,
    NameTooLong,
    CanisterLimitExceeded
}

export interface CanisterDetails {
    name: string,
    canisterId: CanisterId      
}
  
export type CreateSubAccountResponse = { Ok: SubAccountDetails } |
    { AccountNotFound: null } |
    { SubAccountLimitExceeded: null } |
    { NameTooLong: null };

export interface DetachCanisterRequest { canisterId: Principal };
export type DetachCanisterResponse = { Ok: null } |
    { CanisterNotFound: null };

export type GetAccountResponse = { Ok: AccountDetails } |
    { AccountNotFound: null };
export interface GetTransactionsRequest {
    accountIdentifier: AccountIdentifier,
    pageSize: number,
    offset: number,
};
export interface GetTransactionsResponse {
    total: number,
    transactions: Array<Transaction>,
};
export interface HardwareWalletAccountDetails {
    name: string,
    accountIdentifier: AccountIdentifier,
};
export interface Receive {
    fee: E8s,
    from: AccountIdentifier,
    amount: E8s,
};
export interface RegisterHardwareWalletRequest {
    name: string,
    accountIdentifier: AccountIdentifier,
};
export type RegisterHardwareWalletResponse = { Ok: null } |
    { AccountNotFound: null } |
    { HardwareWalletAlreadyRegistered: null } |
    { HardwareWalletLimitExceeded: null } |
    { NameTooLong: null };

export interface RemoveHardwareWalletRequest {
    accountIdentifier: AccountIdentifier,
};
export type RemoveHardwareWalletResponse = { Ok: null } |
    { HardwareWalletNotFound: null };
export interface RenameSubAccountRequest {
    newName: string,
    accountIdentifier: AccountIdentifier,
};
export type RenameSubAccountResponse = { Ok: null } |
    { AccountNotFound: null } |
    { SubAccountNotFound: null } |
    { NameTooLong: null };

export interface Send {
    to: AccountIdentifier,
    fee: E8s,
    amount: E8s,
};
export type SubAccount = Array<number>;
export interface SubAccountDetails {
    id: number,
    name: string,
    accountIdentifier: AccountIdentifier,
};
export type TimestampNanos = bigint;
export interface Transaction {
    type: TransactionType,
    timestamp: TimestampNanos,
    blockHeight: BlockHeight,
    memo: Memo,
    transfer: Transfer,
};
export type Transfer = { Burn: { amount: E8s } } |
    { Mint: { amount: E8s } } |
    { Send: Send } |
    { Receive: Receive };

export default interface ServiceInterface {
    addAccount: () => Promise<AccountIdentifier>,
    attachCanister : (request: AttachCanisterRequest) => Promise<AttachCanisterResult>,
    createSubAccount: (name: string) => Promise<CreateSubAccountResponse>,
    detachCanister: (request: DetachCanisterRequest) => Promise<DetachCanisterResponse>,
    getAccount: () => Promise<GetAccountResponse>,
    getCanisters : () => Promise<Array<CanisterDetails>>,
    getIcpToCyclesConversionRate : () => Promise<bigint>,
    getTransactions: (request: GetTransactionsRequest, principal: Principal) => Promise<GetTransactionsResponse>,
    registerHardwareWallet: (request: RegisterHardwareWalletRequest) => Promise<RegisterHardwareWalletResponse>,
    removeHardwareWallet: (request: RemoveHardwareWalletRequest) => Promise<RemoveHardwareWalletResponse>,
    renameSubAccount: (request: RenameSubAccountRequest) => Promise<RenameSubAccountResponse>,
};