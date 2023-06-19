import type {
  FiatCurrency,
  _SERVICE as TVLService,
  TvlResult,
} from "$lib/canisters/tvl/tvl.types";
import type { Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { QueryParams } from "@dfinity/utils";

export interface TVLCanisterOptions {
  // The agent to use when communicating with the governance canister.
  agent: Agent;
  // The TVL canister's ID.
  canisterId: Principal;
  // For testing purpose
  serviceOverride?: TVLService;
  // For testing purpose
  certifiedServiceOverride?: TVLService;
}

export interface GetTVLCurrency {
  currency?: FiatCurrency;
}

export type GetTVLRequest = QueryParams & GetTVLCurrency;
export type GetTVLResult = TvlResult & GetTVLCurrency;
