import type { Principal } from "@dfinity/agent";
import { Option } from "../option";

export interface AccountBalanceArgs {
    subAccount: Option<SubAccount>,
    account: Principal,
};
export type Block = { V0: BlockV0 };
export type BlockHeight = bigint;
export interface BlockV0 {
    transaction: Transaction,
    timestamp: SystemTime,
};
export type Certification = Option<Array<number>>;
export interface ICPTs { doms: bigint };
export interface LedgerCanisterInitPayload {
    mintingAccount: Principal,
    maxMessageSizeBytes: Option<number>,
    archiveCanister: Option<Principal>,
    initialValues: Array<[Principal, Array<[Option<SubAccount>, ICPTs]>]>,
};
export type Memo = bigint;
export interface NotifyCanisterArgs {
    toSubaccount: Option<SubAccount>,
    fromSubaccount: Option<SubAccount>,
    toCanister: Principal,
    maxFee: ICPTs,
    blockHeight: BlockHeight,
};
export interface SendArgs {
    to: Principal,
    fee: ICPTs,
    toSubaccount: Option<SubAccount>,
    memo: Memo,
    fromSubaccount: Option<SubAccount>,
    amount: ICPTs,
    blockHeight: Option<BlockHeight>,
};
export type SubAccount = Array<number>;
export type SystemTime = bigint;
export interface TotalSupplyArgs {};
export interface Transaction {
    memo: Memo,
    createdAt: BlockHeight,
    transfer: Transfer,
};
export type Transfer = { Burn: { from: Principal, amount: ICPTs } } |
    { Mint: { to: Principal, amount: ICPTs } } |
    { Send: { to: Principal, from: Principal, amount: ICPTs } };
