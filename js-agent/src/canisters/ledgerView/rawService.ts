import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export type BlockHeight = BigNumber;
export type CreateSubAccountResponse = { 'Ok' : NamedSubAccount } |
    { 'AccountNotFound' : null } |
    { 'SubAccountLimitExceeded' : null };
export type Doms = BigNumber;
export interface GetTransactionsRequest {
  'principal' : Principal,
  'page_size' : number,
  'offset' : number,
};
export interface GetTransactionsResponse {
  'total' : number,
  'transactions' : Array<Transaction>,
};
export interface NamedSubAccount {
  'principal' : Principal,
  'name' : string,
  'sub_account' : SubAccount,
};
export interface Receive { 'fee' : Doms, 'from' : Principal, 'amount' : Doms };
export interface Send { 'to' : Principal, 'fee' : Doms, 'amount' : Doms };
export type SubAccount = Array<number>;
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
  'create_sub_account' : (arg_0: string) => Promise<CreateSubAccountResponse>,
  'get_sub_accounts' : () => Promise<Array<NamedSubAccount>>,
  'get_transactions' : (arg_0: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
  'track_account' : () => Promise<undefined>,
};
