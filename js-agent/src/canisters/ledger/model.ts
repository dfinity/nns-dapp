import { Principal } from "@dfinity/agent";

export type SubAccount = ArrayBuffer;

export type BlockHeight = bigint;

export interface ICPTs { 'doms' : bigint };

export interface GetBalanceRequest {
    subAccount?: ArrayBuffer,
    account?: Principal
};

export interface SendICPTsRequest {
    to: Principal,
    amount: ICPTs,
    memo?: ArrayBuffer,
    fee?: ICPTs,
    blockHeight?: BlockHeight,
    fromSubAccount?: ArrayBuffer,
    toSubAccount?: ArrayBuffer
};

export interface NotifyCanisterRequest {
    toCanister : Principal,
    blockHeight : BlockHeight,
    toSubAccount? : SubAccount,
    fromSubAccount? : SubAccount,
    maxFee? : ICPTs,
};
  
export default interface ServiceInterface {
    getBalance(request: GetBalanceRequest): Promise<ICPTs>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>,
    notify(request: NotifyCanisterRequest): Promise<void>
};