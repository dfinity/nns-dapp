import BigNumber from "bignumber.js";
import { GetBalanceRequest, ICPTs, NotifyCanisterRequest, SendICPTsRequest } from "./model";
import { AccountBalanceArgs, ICPTs as RawICPTs, NotifyCanisterArgs, SendArgs } from "./rawService";
import * as convert from "../converters";
import { Principal } from "@dfinity/agent";

export const TRANSACTION_FEE : RawICPTs = { doms: new BigNumber(137) };

export default class RequestConverters {
    public fromGetBalanceRequest(request: GetBalanceRequest, principal: Principal) : AccountBalanceArgs {
        return {
            sub_account: request.subAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.subAccount)],
            account: request.account ?? principal
        };
    }

    public fromSendICPTsRequest(request: SendICPTsRequest): SendArgs {
        return {
            to: request.to,
            fee: request.fee === undefined ? TRANSACTION_FEE : this.fromICPTs(request.fee),
            memo: new BigNumber(0),
            amount: this.fromICPTs(request.amount),
            block_height: request.blockHeight === undefined ? [] : [convert.bigIntToBigNumber(request.blockHeight)],
            from_subaccount: request.fromSubAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.fromSubAccount)],
            to_subaccount: request.toSubAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.toSubAccount)]
        };
    }  
    
    public fromICPTs(icpts: ICPTs): RawICPTs {
        return {
            doms: convert.bigIntToBigNumber(icpts.doms)
        };
    }

    public fromNotifyCanisterRequest(request: NotifyCanisterRequest): NotifyCanisterArgs {
        return {
            to_canister : request.toCanister,
            block_height: convert.bigIntToBigNumber(request.blockHeight),
            to_subaccount : request.toSubAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.toSubAccount)],
            from_subaccount : request.fromSubAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.fromSubAccount)],
            max_fee : request.maxFee === undefined ? TRANSACTION_FEE : this.fromICPTs(request.maxFee),
        };
    }
}
