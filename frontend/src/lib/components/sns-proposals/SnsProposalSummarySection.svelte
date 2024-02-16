<script lang="ts">
  import { fromNullable, nonNullish } from "@dfinity/utils";
  import ProposalSummarySection from "../proposal-detail/ProposalSummarySection.svelte";
  import type { SnsProposalData } from "$lib/types/sns-proposal";

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
