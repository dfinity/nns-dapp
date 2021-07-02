import { Actor, Agent } from "@dfinity/agent";
import IDL from "./canister.did.js";
import CANISTER_ID from "./canisterId";
import RawService from "./rawService";
import Service from "./Service";
import ServiceInterface from "./model";

export default function(agent: Agent) : ServiceInterface {
    const rawService = Actor.createActor(IDL, {
        agent,
        canisterId: CANISTER_ID,
    }) as RawService;
    return new Service(rawService);
}
