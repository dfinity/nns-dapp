import { Principal } from "@dfinity/agent";
import { fromBigNumber } from "../converters";
import RawService from "./service";

export default async function(service: RawService, principal: Principal): Promise<bigint> {
    const result = await service.account_balance({
        sub_account: [],
        account: principal
    });

    return fromBigNumber(result.doms);
}