// import type { Principal } from '@dfinity/principal';
// import type { ActorMethod } from '@dfinity/agent';
// import type { IDL } from '@dfinity/candid';

// export interface Order {
//   'id' : number,
//   'status' : { 'Cancelled' : null } |
//     { 'Completed' : null } |
//     { 'Pending' : null },
//   'paymentAddress' : {
//     'owner' : Principal,
//     'subaccount' : [] | [Uint8Array | number[]],
//   },
//   'timestamp' : bigint,
//   'amount' : bigint,
// }
// export type Result = { 'ok' : Order } |
//   { 'err' : string };
// export type Subaccount = Uint8Array | number[];
// export interface _SERVICE {
//   'checkPaymentStatus' : ActorMethod<[number], Result>,
//   'createOrder' : ActorMethod<[bigint], Result>,
//   'getCanisterPrincipal' : ActorMethod<[], Principal>,
//   'toSubaccount' : ActorMethod<[Principal], Subaccount>,
//   'whoami' : ActorMethod<[], string>,
// }
// export declare const idlFactoryB: IDL.InterfaceFactory;
// export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

export interface Account {
  owner: Principal;
  subaccount: [] | [Uint8Array | number[]];
}
export type Result = { ok: null } | { err: string };
export type Result_1 = { ok: bigint } | { err: string };
export type TokenType =
  | { ICP: null }
  | { ckBTC: null }
  | { ckETH: null }
  | { GLDGov: null }
  | { ckUSDC: null };
export interface TransferArgs {
  order_id: number;
  toAccount: Account;
  amount: bigint;
  token_type: TokenType;
  merchant_name: string;
}
export interface TransferStatus {
  status: { Failed: null } | { Completed: null } | { Pending: null };
  feeAmount: bigint;
  version: bigint;
  blockIndex: [] | [bigint];
  timestamp: bigint;
  payment_gateway: string;
  index_id: bigint;
  toAccount: Account;
  amount: bigint;
  token_type: TokenType;
  merchant_name: string;
}
export interface _SERVICE {
  getAllTransfers: ActorMethod<[], Array<TransferStatus>>;
  getCurrentFeeAddress: ActorMethod<[], Account>;
  getCurrentFeePercentage: ActorMethod<[], number>;
  getTransferStatus: ActorMethod<[number], [] | [TransferStatus]>;
  getTransfers: ActorMethod<[bigint, bigint], Array<TransferStatus>>;
  getVersion: ActorMethod<[], bigint>;
  isOrderCompleted: ActorMethod<[number], boolean>;
  setFeeAddress: ActorMethod<[Account], Result>;
  setFeePercentage: ActorMethod<[number], Result>;
  transfer: ActorMethod<[TransferArgs], Result_1>;
  transferOwnership: ActorMethod<[Principal], Result>;
}
export declare const idlFactoryB: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
