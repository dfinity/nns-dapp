import { Principal } from "@dfinity/agent";

export type BlockHeight = bigint;

export interface ICPTs { 'doms' : bigint };

export interface GetBalanceRequest {
    subAccount?: ArrayBuffer,
    account?: Principal
};

export interface SendICPTsRequest {
    to: Principal,
    amount: ICPTs,
    fee?: ICPTs,
    memo?: ArrayBuffer,
    blockHeight?: BlockHeight,
    fromSubaccount?: ArrayBuffer,
    toSubaccount?: ArrayBuffer
};

export default interface ServiceInterface {
    getBalance(request: GetBalanceRequest): Promise<ICPTs>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>
};