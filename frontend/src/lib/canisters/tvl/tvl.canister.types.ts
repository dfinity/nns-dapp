import type { Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface TVLCanisterOptions {
  // The agent to use when communicating with the governance canister.
  agent: Agent;
  // The TVL canister's ID.
  canisterId: Principal;
}
