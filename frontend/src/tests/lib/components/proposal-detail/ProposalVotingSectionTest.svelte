<script lang="ts">
  import ProposalVotingSection from "$lib/components/proposal-detail/ProposalVotingSection.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalStore,
  } from "$lib/types/selected-proposal.context";
  import { ProposalInfo } from "@dfinity/nns";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let proposalInfo: ProposalInfo;

  const store = writable<SelectedProposalStore>({
    proposalId: proposalInfo.id,
    proposal: proposalInfo,
  });

  setContext(SELECTED_PROPOSAL_CONTEXT_KEY, { store });
</script>

<ProposalVotingSection {proposalInfo} />
