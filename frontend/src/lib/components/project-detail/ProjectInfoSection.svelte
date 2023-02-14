<script lang="ts">
  import type { SnsSummary, SnsSummaryMetadata } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import ProjectSwapDetails from "./ProjectSwapDetails.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import { isNullish } from "@dfinity/utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

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
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_name}</svelte:fragment
      >
      <span
        class="value"
        slot="value"
        data-tid="sns-project-detail-info-token-name">{token.name}</span
      >
    </KeyValuePair>
    <KeyValuePair>
      <svelte:fragment slot="key"
        >{$i18n.sns_project_detail.token_symbol}</svelte:fragment
      >
      <span
        class="value"
        slot="value"
        data-tid="sns-project-detail-info-token-symbol">{token.symbol}</span
      >
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
