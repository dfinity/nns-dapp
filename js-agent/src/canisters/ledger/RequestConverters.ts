import BigNumber from "bignumber.js";
import { GetBalanceRequest, ICPTs, SendICPTsRequest } from "./model";
import { AccountBalanceArgs, ICPTs as RawICPTs, SendArgs } from "./rawService";
import * as convert from "../converters";
import { Principal } from "@dfinity/agent";

const TRANSACTION_FEE : RawICPTs = { doms: new BigNumber(137) };

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
            from_subaccount: request.fromSubaccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.fromSubaccount)],
            to_subaccount: request.toSubaccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.toSubaccount)]
        };
    }  
    
    public fromICPTs(icpts: ICPTs): RawICPTs {
        return {
            doms: convert.bigIntToBigNumber(icpts.doms)
        };
    }
}
