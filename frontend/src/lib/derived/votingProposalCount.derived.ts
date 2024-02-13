import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { votingNnsProposalsStore } from "$lib/stores/voting-proposals.store";
import { derived, type Readable } from "svelte/store";

export interface VotingProposalCountData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number;
}

export const votingProposalCount: Readable<VotingProposalCountData> = derived(
  [votingNnsProposalsStore],
  ([{ proposals: nnsProposals }]) => {
    const nnsProposalCount = nnsProposals?.length ?? 0;
    return {
      [OWN_CANISTER_ID.toText()]: nnsProposalCount,
      // TODO: add snses here
    };
  }
);
