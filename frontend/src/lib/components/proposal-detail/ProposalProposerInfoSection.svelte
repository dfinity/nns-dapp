<script lang="ts">
  import ProposalSummary from "./ProposalSummary.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let title: string | undefined;
  export let summary: string | undefined;
  export let url: string | undefined;
</script>

<div class="content-cell-island">
  <h2 class="content-cell-title" data-tid="proposal-proposer-info-title">
    {$i18n.proposal_detail.summary}
  </h2>

  <div class="content-cell-details">
    <ProposalSummary {summary}>
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
