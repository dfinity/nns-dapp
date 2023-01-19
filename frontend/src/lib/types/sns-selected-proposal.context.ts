import type { SnsProposalData } from "@dfinity/sns";
import type { Writable } from "svelte/store";

/**
 * A store that contains the selected proposal.
 */
export interface SelectedSnsProposalStore {
  proposalId: bigint | undefined;
  proposal: SnsProposalData | undefined;
}
export interface SelectedSnsProposalContext {
  store: Writable<SelectedSnsProposalStore>;
}

export const SELECTED_SNS_PROPOSAL_CONTEXT_KEY = Symbol(
  "selected-sns-proposal"
);
