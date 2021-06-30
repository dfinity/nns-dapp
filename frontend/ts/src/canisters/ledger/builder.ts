import { Agent, Identity } from "@dfinity/agent";
import CANISTER_ID from "./canisterId";
import Service from "./Service";
import ServiceInterface from "./model";

export default function(agent: Agent, identity: Identity) : ServiceInterface {
    return new Service(agent, CANISTER_ID, identity.getPrincipal());
}
