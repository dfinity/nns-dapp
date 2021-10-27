import { Actor, Agent, Identity } from "@dfinity/agent";
import { idlFactory } from "./canister.did.js";
import { idlFactory as idlFactoryCertified } from "./canister_certified.did";
import CANISTER_ID from "./canisterId";
import { _SERVICE } from "./rawService";
import Service from "./Service";
import ServiceInterface from "./model";

export default function (agent: Agent, identity: Identity): ServiceInterface {
  const uncertifiedService = Actor.createActor(idlFactory, {
    agent,
    canisterId: CANISTER_ID,
  }) as _SERVICE;
  const certifiedService = Actor.createActor(idlFactoryCertified, {
    agent,
    canisterId: CANISTER_ID,
  }) as _SERVICE;
  return new Service(agent, CANISTER_ID, uncertifiedService, certifiedService, identity.getPrincipal());
}
