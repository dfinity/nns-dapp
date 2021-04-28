import { Principal } from "@dfinity/agent";
import { AccountIdentifier, BlockHeight, E8s, SubAccount } from "../common/types";

export interface GetBalancesRequest {
    accounts: Array<AccountIdentifier>,
};


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