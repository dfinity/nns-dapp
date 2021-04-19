import { Agent } from "@dfinity/agent";
import IDL from "./canister.did.js";
import buildActor from "../buildActor";
import CANISTER_ID from "./canisterId";
import RawService from "./rawService";
import Service from "./Service";
import ServiceInterface from "./model";

export default function(agent: Agent) : ServiceInterface {
    const rawService = buildActor<RawService>(agent, CANISTER_ID, IDL);
    return new Service(rawService);
}
