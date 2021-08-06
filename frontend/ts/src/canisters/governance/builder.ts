import { Actor, Agent, Identity } from "@dfinity/agent";
import { idlFactory } from "./canister.did.js";
import CANISTER_ID from "./canisterId";
import { _SERVICE } from "./rawService";
import Service from "./Service";
import ServiceInterface from "./model";

export default function (agent: Agent, identity: Identity): ServiceInterface {
  const rawService = Actor.createActor(idlFactory, {
    agent,
    canisterId: CANISTER_ID,
  }) as _SERVICE;
  return new Service(agent, CANISTER_ID, rawService, identity.getPrincipal());
}
