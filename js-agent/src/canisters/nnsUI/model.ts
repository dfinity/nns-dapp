import { AccountIdentifier, BlockHeight, E8s } from "../ledger/model";

export type CreateSubAccountResponse =
    { Ok: NamedSubAccount } |
    { AccountNotFound: null } |
    { SubAccountLimitExceeded: null };
export type GetAccountResponse =
    { Ok: { accountIdentifier: AccountIdentifier, subAccounts: Array<NamedSubAccount> } } |
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
export interface NamedSubAccount {
    id: number,
    accountIdentifier: AccountIdentifier,
    name: string,
};
export interface Receive { fee: E8s, from: AccountIdentifier, amount: E8s };
export interface Send { to: AccountIdentifier, fee: E8s, amount: E8s };
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
    createSubAccount: (name: string) => Promise<CreateSubAccountResponse>,
    getAccount: () => Promise<GetAccountResponse>,
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
    syncTransactions: () => Promise<undefined>,
};