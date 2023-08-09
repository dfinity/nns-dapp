import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { Principal } from "@dfinity/principal";
import type {
  CfParticipant,
  SnsNeuronRecipe,
  SnsParams,
  SnsSwapBuyerState,
  SnsSwapDerivedState,
  SnsSwapInit,
  SnsSwapTicket,
} from "@dfinity/sns";
import type { FinalizeSwapResponse } from "@dfinity/sns/dist/candid/sns_swap";
import type { PngDataUrl } from "./assets";

export type RootCanisterId = Principal;
export type RootCanisterIdText = string;

/**
 * Metadata are full optional in Candid files but mandatory currently in NNS-dapp
 */
export interface SnsSummaryMetadata {
  url: PngDataUrl;
  logo: string;
  name: string;
  description: string;
}

export interface SnsSummarySwap {
  auto_finalize_swap_response: [] | [FinalizeSwapResponse];
  next_ticket_id: [] | [bigint];
  already_tried_to_auto_finalize: [] | [boolean];
  purge_old_tickets_last_completion_timestamp_nanoseconds: [] | [bigint];
  purge_old_tickets_next_principal: [] | [Uint8Array];
  neuron_recipes: Array<SnsNeuronRecipe>;
  cf_participants: Array<CfParticipant>;
  decentralization_sale_open_timestamp_seconds?: bigint;
  // We don't use it for now and keep it as the candid optional type
  finalize_swap_in_progress: [] | [boolean];
  // We don't use it for now and keep it as the candid optional type
  init: [] | [SnsSwapInit];
  lifecycle: number;
  buyers: Array<[string, SnsSwapBuyerState]>;
  params: SnsParams;
  // We don't use it for now and keep it as the candid optional type
  open_sns_token_swap_proposal_id: [] | [bigint];
}

export interface SnsSummary {
  rootCanisterId: RootCanisterId;
  // Used to calculate the account for the participation.
  swapCanisterId: Principal;
  // Used to show destination when staking sns neurons.
  governanceCanisterId: Principal;
  // Used to observe accounts' balance
  ledgerCanisterId: Principal;
  // Used to observe accounts' transactions
  indexCanisterId: Principal;

  /**
   * The metadata of the Sns project (title, description, etc.)
   */
  metadata: SnsSummaryMetadata;

  /**
   * The token metadata of the Sns project (name of the token and symbol)
   */
  token: IcrcTokenMetadata;

  /**
   * The initial information of the sale (min-max ICP etc.) and its current state (pending, open, committed etc.)
   */
  swap: SnsSummarySwap;
  /**
   * Derived information about the sale such as the current total of ICP all buyers have invested so far
   */
  derived: SnsSwapDerivedState;
}

export interface SnsSwapCommitment {
  rootCanisterId: RootCanisterId;
  // sns swap canister doesn't return any `SnsSwapBuyerState` if user has no commitment
  myCommitment: SnsSwapBuyerState | undefined;
}

export interface SnsTicket {
  rootCanisterId: Principal;
  ticket?: SnsSwapTicket;
}
