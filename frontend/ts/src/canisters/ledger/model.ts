import { AccountIdentifier, BlockHeight, CanisterIdString, E8s, SubAccount } from "../common/types";

export interface GetBalancesRequest {
    accounts: Array<AccountIdentifier>,
}


export interface SendICPTsRequest {
    to: AccountIdentifier,
    amount: E8s,
    memo?: bigint,
    fee?: E8s,
    blockHeight?: BlockHeight,
    fromSubAccountId?: number,
}

export interface NotifyCanisterRequest {
    toCanister : CanisterIdString,
    blockHeight : BlockHeight,
    toSubAccount? : SubAccount,
    fromSubAccountId? : number,
    maxFee? : E8s,
}
  
export default interface ServiceInterface {
    getBalances(request: GetBalancesRequest): Promise<Record<AccountIdentifier, E8s>>,
    sendICPTs(request: SendICPTsRequest): Promise<BlockHeight>,
    notify(request: NotifyCanisterRequest): Promise<Uint8Array>
}