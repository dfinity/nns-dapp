import { createAgent } from "$lib/api/agent.api";
import { HOST } from "$lib/constants/environment.constants";
import type { ActorMethod, ActorSubclass, Identity } from "@dfinity/agent";
import { Actor } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import type { Principal } from "@dfinity/principal";
import type {
  Meta,
  _SERVICE as DemoAppsActor,
} from "../canisters/demoapps/demoapps.did";
import { idlFactory as idlFactorDemoApps } from "../canisters/demoapps/demoapps.factory.did.js";

/**
 * ⚠️ THIS SHOULD NEVER LAND ON MAINNET ⚠️
 */

export const queryDemoAppsMeta = async (params: {
  canisterId: Principal;
  identity: Identity;
}): Promise<Meta> => {
  const actor = await getDemoAppsActor(params);
  return actor.meta();
};

const getDemoAppsActor = async ({
  identity,
  canisterId,
}: {
  canisterId: Principal;
  identity: Identity;
}): Promise<DemoAppsActor> =>
  createActor({
    canisterId,
    idlFactory: idlFactorDemoApps,
    identity,
  });

const createActor = async <T = Record<string, ActorMethod>>({
  canisterId,
  idlFactory,
  identity,
}: {
  canisterId: string | Principal;
  idlFactory: IDL.InterfaceFactory;
  identity: Identity;
}): Promise<ActorSubclass<T>> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
