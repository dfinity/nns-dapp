import { Principal } from "@dfinity/agent";

export type BlockHeight = bigint;
export type Doms = bigint;
export interface GetTransactionsRequest {
    pageSize: number,
    offset: number,
};
export interface GetTransactionsResponse {
    total: number,
    transactions: Array<Transaction>,
};
export interface Receive { fee: Doms, from: Principal, amount: Doms };
export interface Send { to: Principal, fee: Doms, amount: Doms };
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
    getTransactions: (request: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
};