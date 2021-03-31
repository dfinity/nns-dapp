import { BlockHeight, ICPTs } from "./model";
import { BlockHeight as RawBlockHeight, ICPTs as RawICPTs } from "./rawService";
import * as convert from "../converter";

export default class ResponseConverters {
    
    public toBlockHeight = (rawBlockHeight: RawBlockHeight) : BlockHeight => {
        return convert.bigNumberToBigInt(rawBlockHeight);
    }

    public toICPTs = (rawICPTs: RawICPTs) : ICPTs =>{
        return {
            doms: convert.bigNumberToBigInt(rawICPTs.doms)
        };
    }
}
