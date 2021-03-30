import { Principal } from "@dfinity/agent";

export type SubAccount = ArrayBuffer;

export type BlockHeight = bigint;

export interface ICPTs { doms: bigint };

export interface GetBalancesRequest {
    accounts: Array<AccountIdentifier>,
};

export type AccountIdentifier = string;

export interface SendICPTsRequest {
    to: AccountIdentifier,
    amount: ICPTs,
    memo?: ArrayBuffer,
    fee?: ICPTs,
    blockHeight?: BlockHeight,
    fromSubAccountId?: number,
};

export interface NotifyCanisterRequest {
    toCanister : Principal,
    blockHeight : BlockHeight,
    toSubAccount? : SubAccount,
    fromSubAccountId? : number,
    maxFee? : ICPTs,
};
  
export default interface ServiceInterface {
    getBalances(request: GetBalancesRequest): Promise<Record<AccountIdentifier, ICPTs>>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>,
    notify(request: NotifyCanisterRequest): Promise<void>
};