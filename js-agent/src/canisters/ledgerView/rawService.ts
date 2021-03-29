import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export type AccountIdentifier = string;
export type BlockHeight = BigNumber;
export type CreateSubAccountResponse = { 'Ok' : NamedSubAccount } |
    { 'AccountNotFound' : null } |
    { 'SubAccountLimitExceeded' : null };
export type Doms = BigNumber;
export type GetAccountResponse = {
  'Ok' : {
    'account_identifier' : AccountIdentifier,
    'sub_accounts' : Array<NamedSubAccount>,
  }
} |
    { 'AccountNotFound' : null };
export interface GetTransactionsRequest {
  'page_size' : number,
  'offset' : number,
  'account_identifier' : AccountIdentifier,
};
export interface GetTransactionsResponse {
  'total' : number,
  'transactions' : Array<Transaction>,
};
export interface NamedSubAccount {
  'name' : string,
  'sub_account' : SubAccount,
  'account_identifier' : AccountIdentifier,
};
export interface Receive {
  'fee' : Doms,
  'from' : AccountIdentifier,
  'amount' : Doms,
};
export interface Send {
  'to' : AccountIdentifier,
  'fee' : Doms,
  'amount' : Doms,
};
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
  'add_account' : () => Promise<AccountIdentifier>,
  'create_sub_account' : (arg_0: string) => Promise<CreateSubAccountResponse>,
  'get_account' : () => Promise<GetAccountResponse>,
  'get_transactions' : (arg_0: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
};
