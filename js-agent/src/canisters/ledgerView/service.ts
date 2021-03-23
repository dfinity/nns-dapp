import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export type BlockHeight = BigNumber;
export type Doms = BigNumber;
export interface GetTransactionsRequest {
  'page_size' : number,
  'offset' : number,
};
export interface GetTransactionsResponse {
  'total' : number,
  'transactions' : Array<Transaction>,
};
export interface Receive { 'fee' : Doms, 'from' : Principal, 'amount' : Doms };
export interface Send { 'to' : Principal, 'fee' : Doms, 'amount' : Doms };
export interface Timestamp { 'secs' : BigNumber, 'nanos' : number };
export interface Transaction {
  'timestamp' : Timestamp,
  'block_height' : BlockHeight,
  'transfer' : Transfer,
};
export type Transfer = { 'Burn' : { 'amount' : Doms } } |
  { 'Mint' : { 'amount' : Doms } } |
  { 'Send' : Send } |
  { 'Receive' : Receive };
export default interface _SERVICE {
  'get_transactions' : (arg_0: GetTransactionsRequest) => Promise<
      GetTransactionsResponse
    >,
};
