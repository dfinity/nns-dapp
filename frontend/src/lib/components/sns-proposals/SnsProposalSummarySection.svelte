<script lang="ts">
  import ProposalSummarySection from "$lib/components/proposal-detail/ProposalSummarySection.svelte";
  import type { SnsProposalData } from "@dfinity/sns";
  import { fromNullable, nonNullish } from "@dfinity/utils";

  export let proposal: SnsProposalData;

  // sns-js doesn't expose the type of the property `proposal` inside the `SnsProposalData` type.
  let proposalData = fromNullable(proposal.proposal);
  $: proposalData = fromNullable(proposal.proposal);
</script>

{#if nonNullish(proposalData)}
  <ProposalSummarySection
    title={proposalData.title}
    summary={proposalData.summary}
    url={proposalData.url}
  />
{/if}
