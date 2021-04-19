import { BlockHeight, Doms } from "./model";
import { AccountBalanceResponse, SendResponse } from "./types/types_pb";

export default class ResponseConverters {
    
    public toBlockHeight = (response: SendResponse) : BlockHeight => {
        const blockHeight = response.getResultingHeight();
        return BigInt(blockHeight.getHeight());
    }

    public toDoms = (response: AccountBalanceResponse) : Doms =>{
        const icpts = response.getBalance();
        return BigInt(icpts.getE8s());
    }
}
