import { Principal } from "@dfinity/agent";

export type BlockHeight = bigint;
export type CreateSubAccountResponse =
    { Ok: NamedSubAccount } |
    { AccountNotFound: null } |
    { SubAccountLimitExceeded: null };
export type Doms = bigint;
export interface GetTransactionsRequest {
    principal: Principal,
    pageSize: number,
    offset: number,
};
export interface GetTransactionsResponse {
    total: number,
    transactions: Array<Transaction>,
};
export interface NamedSubAccount {
    principal: Principal,
    name: string,
    subAccount: SubAccount,
};
export interface Receive { fee: Doms, from: Principal, amount: Doms };
export interface Send { to: Principal, fee: Doms, amount: Doms };
export type SubAccount = Array<number>;
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
    createSubAccount: (name: string) => Promise<CreateSubAccountResponse>,
    getSubAccounts: () => Promise<Array<NamedSubAccount>>,
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
    trackAccount: () => Promise<undefined>,
};