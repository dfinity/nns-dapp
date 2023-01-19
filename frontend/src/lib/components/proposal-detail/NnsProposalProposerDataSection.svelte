<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import NnsProposalProposerPayloadEntry from "./NnsProposalProposerPayloadEntry.svelte";
  import NnsProposalProposerActionsEntry from "./NnsProposalProposerActionsEntry.svelte";
  import type { Proposal, ProposalId } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  let proposal: Proposal | undefined;
  $: ({ id, proposal } = mapProposalInfo(proposalInfo));
</script>

{#if proposal !== undefined}
  <NnsProposalProposerActionsEntry {proposal} />

  <NnsProposalProposerPayloadEntry {proposal} proposalId={id} />
{/if}
