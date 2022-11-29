<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import ProposalSummary from "./ProposalSummary.svelte";
  import type { Proposal } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<div class="content-cell-island">
  <h2 class="content-cell-title" data-tid="proposal-proposer-info-title">
    {$i18n.proposal_detail.summary}
  </h2>

  <div class="content-cell-details">
    <ProposalSummary {proposal}>
      <svelte:fragment slot="title">
        <h1>{title ?? ""}</h1>

        {#if url}
          <a target="_blank" href={url} rel="noopener noreferrer">{url}</a>
        {/if}
      </svelte:fragment>
    </ProposalSummary>
  </div>
</div>

<style lang="scss">
  a {
    overflow-wrap: break-word;
  }
</style>
