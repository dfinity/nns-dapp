<script lang="ts">
  import type { SnsProposalData } from "@dfinity/sns";
  import { fromNullable, nonNullish } from "@dfinity/utils";
  import ProposalProposerInfoSection from "../proposal-detail/ProposalProposerInfoSection.svelte";

  export let proposal: SnsProposalData;

  // sns-js doesn't expose the type of the property `proposal` inside the `SnsProposalData` type.
  let proposalData = fromNullable(proposal.proposal);
  $: proposalData = fromNullable(proposal.proposal);
</script>

{#if nonNullish(proposalData)}
  <ProposalProposerInfoSection
    title={proposalData.title}
    summary={proposalData.summary}
    url={proposalData.url}
  />
{/if}
