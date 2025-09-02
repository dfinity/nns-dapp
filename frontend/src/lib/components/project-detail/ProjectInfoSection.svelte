<script lang="ts">
  import ProjectSwapDetails from "$lib/components/project-detail/ProjectSwapDetails.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummary, SnsSummaryMetadata } from "$lib/types/sns";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { getContext } from "svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary | undefined | null;
  $: summary = $projectDetailStore.summary;

  let metadata: SnsSummaryMetadata | undefined;
  let token: IcrcTokenMetadata | undefined;

  $: metadata = summary?.metadata;
  $: token = summary?.token;
</script>

{#if !isNullish(metadata) && !isNullish(token)}
  <div
    data-tid="sns-project-detail-info"
    class="content-cell-details content-cell-island"
  >
    <KeyValuePair>
      {#snippet key()}{$i18n.sns_project_detail.token_name}{/snippet}
      {#snippet value()}
        <span class="value" data-tid="sns-project-detail-info-token-name"
          >{token.name}</span
        >{/snippet}
    </KeyValuePair>
    <KeyValuePair>
      {#snippet key()}{$i18n.sns_project_detail.token_symbol}{/snippet}
      {#snippet value()}
        <span class="value" data-tid="sns-project-detail-info-token-symbol"
          >{token.symbol}</span
        >{/snippet}
    </KeyValuePair>

    <ProjectSwapDetails />
  </div>
{/if}

<style lang="scss">
  .content-cell-details {
    margin-top: 0;
    gap: var(--padding-2x);
  }
</style>
