import BigNumber from "bignumber.js";
import { Principal } from "@dfinity/agent/lib/cjs/principal";
import * as convert from "../converters";
import RawService, { ICPTs, SendArgs } from "./service";

const TRANSACTION_FEE : ICPTs = { doms: new BigNumber(137) };

export interface SendICPTsRequest {
    to: Principal,
    amount: ICPTs,
    fee?: ICPTs,
    memo?: ArrayBuffer,
    blockHeight?: bigint,
    fromSubaccount?: ArrayBuffer,
    toSubaccount?: ArrayBuffer
};

export default async function(service: RawService, request: SendICPTsRequest): Promise<bigint> {
    const result = await service.send(convertRequest(request));
    return convert.bigNumberToBigInt(result);
}

function convertRequest(request: SendICPTsRequest): SendArgs {
    return {
        to: request.to,
        fee: request.fee ?? TRANSACTION_FEE,
        memo: new BigNumber(0),
        amount: request.amount,
        block_height: request.blockHeight === undefined ? [] : [convert.bigIntToBigNumber(request.blockHeight)],
        from_subaccount: request.fromSubaccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.fromSubaccount)],
        to_subaccount: request.toSubaccount === undefined ? [] : [convert.arrayBufferToArrayOfNumber(request.toSubaccount)]
    };
}
