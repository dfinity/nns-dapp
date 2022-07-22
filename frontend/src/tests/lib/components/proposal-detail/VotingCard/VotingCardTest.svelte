<script lang="ts">
  import { setContext } from "svelte";
  import { ProposalInfo } from "@dfinity/nns";
  import VotingCard from "../../../../../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalStore,
  } from "../../../../../lib/types/selected-proposal.context";
  import { writable } from "svelte/store";

  export let proposalInfo: ProposalInfo;

  const store = writable<SelectedProposalStore>({
    proposalId: proposalInfo.id,
    proposal: proposalInfo,
  });

  setContext(SELECTED_PROPOSAL_CONTEXT_KEY, store);
</script>

<VotingCard {proposalInfo} />
