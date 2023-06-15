<script lang="ts">
  import ProposalSummary from "./ProposalSummary.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let title: string | undefined;
  export let summary: string | undefined;
  export let url: string | undefined;
</script>

<div class="content-cell-island" data-tid="proposal-summary-section-component">
  <h2 class="content-cell-title" data-tid="proposal-summary-title">
    {$i18n.proposal_detail.summary}
  </h2>

  <div class="content-cell-details">
    <ProposalSummary {summary}>
      <svelte:fragment slot="title">
        <p data-tid="propose-summary-title" class="value">{title ?? ""}</p>

        {#if url}
          <a
            target="_blank"
            href={url}
            rel="noopener noreferrer"
            data-tid="proposal-summary-url">{url}</a
          >
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
