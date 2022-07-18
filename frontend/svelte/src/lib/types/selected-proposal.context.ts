import type {ProposalId, ProposalInfo} from "@dfinity/nns";
import type { Writable } from "svelte/store";

/**
 * A store that contains the selected proposal.
 */
export interface SelectedProposalStore {
  proposalId: ProposalId | undefined;
  proposal: ProposalInfo | undefined;
}
export interface SelectedProposalContext {
  store: Writable<SelectedProposalStore>;
}

export const SELECTED_PROPOSAL_CONTEXT_KEY = Symbol("selected-proposal");
