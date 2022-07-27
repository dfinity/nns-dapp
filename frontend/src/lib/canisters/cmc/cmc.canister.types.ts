import type { Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { _SERVICE } from "./cmc.types";

export interface CMCCanisterOptions {
  // The agent to use when communicating with the governance canister.
  agent: Agent;
  // The CMC canister's ID.
  canisterId: Principal;
  // The default service to use when calling into the IC. Primarily overridden
  // in test for mocking.
  serviceOverride?: _SERVICE;
}
