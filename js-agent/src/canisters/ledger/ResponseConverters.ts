import { BlockHeight, Doms } from "./model";
import { BlockHeight as RawBlockHeight, ICPTs as RawICPTs } from "./rawService";
import * as convert from "../converter";

export default class ResponseConverters {
    
    public toBlockHeight = (rawBlockHeight: RawBlockHeight) : BlockHeight => {
        return convert.bigNumberToBigInt(rawBlockHeight);
    }

    public toDoms = (rawICPTs: RawICPTs) : Doms =>{
        return convert.bigNumberToBigInt(rawICPTs.doms);
    }
}
