import { Principal } from "@dfinity/agent";

export type SubAccount = ArrayBuffer;

export type BlockHeight = bigint;

export type Doms = bigint;

export interface GetBalancesRequest {
    accounts: Array<AccountIdentifier>,
};

export type AccountIdentifier = string;

export interface SendICPTsRequest {
    to: AccountIdentifier,
    amount: Doms,
    memo?: Uint8Array,
    fee?: Doms,
    blockHeight?: BlockHeight,
    fromSubAccountId?: number,
};

export interface NotifyCanisterRequest {
    toCanister : Principal,
    blockHeight : BlockHeight,
    toSubAccount? : SubAccount,
    fromSubAccountId? : number,
    maxFee? : Doms,
};
  
export default interface ServiceInterface {
    getBalances(request: GetBalancesRequest): Promise<Record<AccountIdentifier, Doms>>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>,
    notify(request: NotifyCanisterRequest): Promise<void>
};