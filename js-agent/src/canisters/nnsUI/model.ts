import { AccountIdentifier, BlockHeight, E8s } from "../common/types";
import { CanisterId } from "../ledger/createCanister";

export interface AccountDetails {
    accountIdentifier: AccountIdentifier,
    hardwareWalletAccounts: Array<HardwareWalletAccountDetails>,
    subAccounts: Array<SubAccountDetails>,
};

export interface AttachCanisterRequest {
    name: string,
    canisterId: CanisterId      
}

export enum AttachCanisterResult {
    Ok,
    CanisterAlreadyAttached,
    NameAlreadyTaken,
    CanisterLimitExceeded
}

export type CanisterAlreadyAttached = {
    kind: "canisterAlreadyAttached"
}

export type CanisterNameAlreadyTaken = {
    kind: "canisterNameAlreadyTaken"
}

export type CanisterLimitExceeded = {
    kind: "canisterLimitExceeded"
}

export interface CanisterDetails {
    name: string,
    canisterId: CanisterId      
}
  
export type CreateSubAccountResponse = { Ok: SubAccountDetails } |
    { AccountNotFound: null } |
    { SubAccountLimitExceeded: null } |
    { NameTooLong: null };
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
    { HardwareWalletLimitExceeded: null } |
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
    timestamp: TimestampNanos,
    blockHeight: BlockHeight,
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
    getAccount: () => Promise<GetAccountResponse>,
    getCanisters : () => Promise<Array<CanisterDetails>>,
    getIcpToCyclesConversionRate : () => Promise<number>,
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
    registerHardwareWallet: (request: RegisterHardwareWalletRequest) => Promise<RegisterHardwareWalletResponse>,
    syncTransactions: () => Promise<undefined>,
};