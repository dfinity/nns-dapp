import BigNumber from "bignumber.js";
import { Principal } from "@dfinity/agent/lib/cjs/principal";
import { fromBigNumber, toBigNumber } from "../converters";
import RawService, { ICPTs, SendArgs } from "./service";

const TRANSACTION_FEE : ICPTs = fromDoms(BigInt(137));

export interface SendICPTsRequest {
    to: Principal,
    amount: bigint
};

export default async function(service: RawService, request: SendICPTsRequest): Promise<bigint> {
    const result = await service.send(convertRequest(request));
    return fromBigNumber(result);
}

function convertRequest(request: SendICPTsRequest): SendArgs {
    return {
        to: request.to,
        fee: TRANSACTION_FEE,
        memo: new BigNumber(0),
        amount: fromDoms(request.amount),
        block_height: [],
        from_subaccount: [],
        to_subaccount: []
    };
}

function fromDoms(amount: bigint) : ICPTs {
    return { doms: toBigNumber(amount) }
}
