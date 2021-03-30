import BigNumber from "bignumber.js";
import { GetBalancesRequest, ICPTs, NotifyCanisterRequest, SendICPTsRequest } from "./model";
import { AccountBalanceArgs, ICPTs as RawICPTs, NotifyCanisterArgs, SendArgs, SubAccount } from "./rawService";
import * as convert from "../converters";
import { SUB_ACCOUNT_BYTE_LENGTH } from "../constants";

export const TRANSACTION_FEE : RawICPTs = { doms: new BigNumber(137) };

export default class RequestConverters {
    public fromGetBalancesRequest = (request: GetBalancesRequest) : Array<AccountBalanceArgs> => {
        return request.accounts.map(a => ({ account: a }));
    }

    public fromSendICPTsRequest = (request: SendICPTsRequest) : SendArgs => {
        return {
            to: request.to,
            fee: request.fee === undefined ? TRANSACTION_FEE : this.fromICPTs(request.fee),
            memo: new BigNumber(0),
            amount: this.fromICPTs(request.amount),
            block_height: request.blockHeight === undefined ? [] : [convert.bigIntToBigNumber(request.blockHeight)],
            from_subaccount: request.fromSubAccountId === undefined ? [] : [this.subAccountIdToSubAccount(request.fromSubAccountId)]
        };
    }  
    
    public fromICPTs = (icpts: ICPTs) : RawICPTs => {
        return {
            doms: convert.bigIntToBigNumber(icpts.doms)
        };
    }

    public fromNotifyCanisterRequest = (request: NotifyCanisterRequest) : NotifyCanisterArgs => {
        return {
            to_canister : request.toCanister,
            block_height: convert.bigIntToBigNumber(request.blockHeight),
            to_subaccount : request.toSubAccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.toSubAccount)],
            from_subaccount: request.fromSubAccountId === undefined ? [] : [this.subAccountIdToSubAccount(request.fromSubAccountId)],
            max_fee : request.maxFee === undefined ? TRANSACTION_FEE : this.fromICPTs(request.maxFee),
        };
    }

    private subAccountIdToSubAccount = (index: number) : SubAccount => {
        const bytes = convert.numberToArrayBuffer(index, SUB_ACCOUNT_BYTE_LENGTH);
        return convert.arrayBufferToArrayOfNumber(bytes);
    }
}
