<script lang="ts">
  import { setContext } from "svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import NnsProposal from "$lib/components/proposal-detail/NnsProposal.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalStore,
  } from "$lib/types/selected-proposal.context";
  import { writable } from "svelte/store";

  export let proposalInfo: ProposalInfo;

  const store = writable<SelectedProposalStore>({
    proposalId: proposalInfo.id,
    proposal: proposalInfo,
  });

  setContext(SELECTED_PROPOSAL_CONTEXT_KEY, { store });
</script>

<NnsProposal />
