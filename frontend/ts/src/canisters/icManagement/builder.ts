import { Actor, Agent, CallConfig } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import Service from "./Service";
import ServiceInterface from "./model";
import IDL from "./canister.did.js";
import RawService from "./rawService";

// https://sdk.dfinity.org/docs/interface-spec/index.html#ic-management-canister
const MANAGEMENT_CANISTER_ID = Principal.fromText("aaaaa-aa");

export default function(agent: Agent) : ServiceInterface {

    // eslint-disable-next-line
    function transform(_methodName: string, args: unknown[], _callConfig: CallConfig) {
        // eslint-disable-next-line
        const first = args[0] as any;
        let effectiveCanisterId = MANAGEMENT_CANISTER_ID;
        if (first && typeof first === 'object' && first.canister_id) {
            effectiveCanisterId = Principal.from(first.canister_id as unknown);
        }
        return { effectiveCanisterId };
    }

    const config: CallConfig = {
        agent
    };

    const rawService = Actor.createActor<RawService>(IDL, {
        ...config,
        canisterId: MANAGEMENT_CANISTER_ID,
        ...{
            callTransform: transform,
            queryTransform: transform,
        },
    });
    
    return new Service(rawService);
}
