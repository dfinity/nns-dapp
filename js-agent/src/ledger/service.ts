import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export interface AccountBalanceArgs {
  'sub_account' : [] | [SubAccount],
  'account' : Principal,
};
export interface Block {
  'transaction' : Transaction,
  'timestamp' : SystemTime,
};
export type BlockHeight = BigNumber;
export type Certification = [] | [Array<number>];
export interface ICPTs { 'doms' : BigNumber };
export interface LedgerCanisterInitPayload {
  'minting_account' : Principal,
  'max_message_size_bytes' : [] | [number],
  'archive_canister' : [] | [Principal],
  'initial_values' : Array<[Principal, Array<[[] | [SubAccount], ICPTs]>]>,
};
export type Memo = BigNumber;
export interface NotifyCanisterArgs {
  'to_subaccount' : [] | [SubAccount],
  'from_subaccount' : [] | [SubAccount],
  'to_canister' : Principal,
  'max_fee' : ICPTs,
  'block_height' : BlockHeight,
};
export interface SendArgs {
  'to' : Principal,
  'fee' : ICPTs,
  'to_subaccount' : [] | [SubAccount],
  'memo' : Memo,
  'from_subaccount' : [] | [SubAccount],
  'amount' : ICPTs,
  'block_height' : [] | [BlockHeight],
};
export type SubAccount = Array<number>;
export type SystemTime = BigNumber;
export interface TotalSupplyArgs {};
export interface Transaction {
  'memo' : Memo,
  'created_at' : BlockHeight,
  'transfer' : Transfer,
};
export type Transfer = { 'Burn' : { 'from' : Principal, 'amount' : ICPTs } } |
  { 'Mint' : { 'to' : Principal, 'amount' : ICPTs } } |
  { 'Send' : { 'to' : Principal, 'from' : Principal, 'amount' : ICPTs } };
export default interface _SERVICE {
  'account_balance' : (arg_0: AccountBalanceArgs) => Promise<ICPTs>,
  'block' : (arg_0: BlockHeight) => Promise<[] | [Block]>,
  'notify' : (arg_0: NotifyCanisterArgs) => Promise<undefined>,
  'send' : (arg_0: SendArgs) => Promise<BigNumber>,
  'supply' : (arg_0: TotalSupplyArgs) => Promise<ICPTs>,
  'tip_of_chain' : () => Promise<[Certification, BlockHeight]>,
};
