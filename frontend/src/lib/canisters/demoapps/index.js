import { Actor, HttpAgent } from "@dfinity/agent";
// Imports and re-exports candid interface
import { idlFactory } from "./demoapps.factory.did.js";

export { idlFactory } from "./demoapps.factory.did.js";

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.DEMOAPPS_CANISTER_ID;

export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const demoapps = createActor(canisterId);
