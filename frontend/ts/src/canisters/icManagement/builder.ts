import { Actor, Agent, CallConfig } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import Service from "./Service";
import ServiceInterface from "./model";
import IDL from "./canister.did.js";
import RawService from "./rawService";
import CANISTER_ID from "./canisterId";

export default function(agent: Agent) : ServiceInterface {

    function transform(methodName: string, args: unknown[], callConfig: CallConfig) {
        const first = args[0] as any;
        let effectiveCanisterId = CANISTER_ID;
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
        canisterId: CANISTER_ID,
        ...{
            callTransform: transform,
            queryTransform: transform,
        },
    });
    
    return new Service(rawService);
}
