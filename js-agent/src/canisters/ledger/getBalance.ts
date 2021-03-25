import { Principal } from "@dfinity/agent";
import * as convert from "../converters";
import RawService from "./service";

export default async function(service: RawService, principal: Principal): Promise<bigint> {
    const result = await service.account_balance({
        sub_account: [],
        account: principal
    });

    return convert.bigNumberToBigInt(result.doms);
}