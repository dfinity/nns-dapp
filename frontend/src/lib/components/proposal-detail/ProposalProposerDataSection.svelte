<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import ProposalProposerPayloadEntry from "./ProposalProposerPayloadEntry.svelte";
  import ProposalProposerActionsEntry from "./ProposalProposerActionsEntry.svelte";
  import type { Proposal, ProposalId } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  let proposal: Proposal | undefined;
  $: ({ id, proposal } = mapProposalInfo(proposalInfo));
</script>

{#if proposal !== undefined}
  <ProposalProposerActionsEntry {proposal} />

  <ProposalProposerPayloadEntry {proposal} proposalId={id} />
{/if}
