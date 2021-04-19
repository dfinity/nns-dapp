import { AccountIdentifier, BlockHeight, Doms } from "../ledger/model";

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
export interface Receive { fee: Doms, from: AccountIdentifier, amount: Doms };
export interface Send { to: AccountIdentifier, fee: Doms, amount: Doms };
export interface Timestamp { secs: bigint, nanos: number };
export interface Transaction {
    timestamp: Timestamp,
    blockHeight: BlockHeight,
    transfer: Transfer,
};
export type Transfer = { Burn: { amount: Doms } } |
    { Mint: { amount: Doms } } |
    { Send: Send } |
    { Receive: Receive };
export default interface ServiceInterface {
    addAccount: () => Promise<AccountIdentifier>,
    createSubAccount: (name: string) => Promise<CreateSubAccountResponse>,
    getAccount: () => Promise<GetAccountResponse>,
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
    syncTransactions: () => Promise<undefined>,
};