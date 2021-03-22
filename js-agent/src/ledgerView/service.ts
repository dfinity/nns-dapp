import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export type BlockHeight = BigNumber;
export type Doms = BigNumber;
export interface Receive { 'fee' : Doms, 'from' : Principal, 'amount' : Doms };
export interface SearchRequest { 'page_size' : number, 'offset' : number };
export interface SearchResponse {
  'total' : Doms,
  'transactions' : Array<Transaction>,
};
export interface Send { 'to' : Principal, 'fee' : Doms, 'amount' : Doms };
export interface Timestamp { 'secs' : BigNumber, 'nanos' : number };
export interface Transaction {
  'balance' : Doms,
  'timestamp' : Timestamp,
  'block_height' : BlockHeight,
  'transfer' : Transfer,
};
export type Transfer = { 'Burn' : { 'amount' : Doms } } |
  { 'Mint' : { 'amount' : Doms } } |
  { 'Send' : Send } |
  { 'Receive' : Receive };
export default interface _SERVICE {
  'search' : (arg_0: SearchRequest) => Promise<SearchResponse>,
};
