import { Principal } from "@dfinity/agent";

export type SubAccount = Uint8Array;

export type BlockHeight = bigint;

export type E8s = bigint;

export interface GetBalancesRequest {
    accounts: Array<AccountIdentifier>,
};

export type AccountIdentifier = string;

export interface SendICPTsRequest {
    to: AccountIdentifier,
    amount: E8s,
    memo?: Uint8Array,
    fee?: E8s,
    blockHeight?: BlockHeight,
    fromSubAccountId?: number,
};

export interface NotifyCanisterRequest {
    toCanister : Principal,
    blockHeight : BlockHeight,
    toSubAccount? : SubAccount,
    fromSubAccountId? : number,
    maxFee? : E8s,
};
  
export default interface ServiceInterface {
    getBalances(request: GetBalancesRequest): Promise<Record<AccountIdentifier, E8s>>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>,
    notify(request: NotifyCanisterRequest): Promise<Uint8Array>
};