import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { votingNnsProposalsStore } from "$lib/stores/voting-proposals.store";
import { votingSnsProposalsStore } from "$lib/stores/voting-sns-proposals.store";
import { derived, type Readable } from "svelte/store";

export interface VotingProposalCountData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number | undefined;
}

export const votingProposalCountStore: Readable<VotingProposalCountData> =
  derived(
    [votingNnsProposalsStore, votingSnsProposalsStore],
    ([{ proposals: nnsProposals }]) => {
      console.log("votingProposalCountStore derived", nnsProposals);
      return {
        [OWN_CANISTER_ID.toText()]: nnsProposals?.length,
        // TODO: add Snses here
      };
    }
  );
