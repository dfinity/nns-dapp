<script lang="ts">
  import type {
    SnsSummary,
    SnsSummaryMetadata,
    SnsTokenMetadata,
  } from "../../types/sns";
  import { i18n } from "../../stores/i18n";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import ProjectSwapDetails from "./ProjectSwapDetails.svelte";
  import Logo from "../ui/Logo.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import { isNullish } from "../../utils/utils";
  import SkeletonDetails from "../ui/SkeletonDetails.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary | undefined | null;
  $: summary = $projectDetailStore.summary;

  let metadata: SnsSummaryMetadata | undefined;
  let token: SnsTokenMetadata | undefined;

  $: metadata = summary?.metadata;
  $: token = summary?.token;
</script>

{#if isNullish(metadata) || isNullish(token)}
  <SkeletonDetails />
{:else}
  <div data-tid="sns-project-detail-info">
    <div class="title">
      <Logo src={metadata.logo} alt={$i18n.sns_launchpad.project_logo} />
      <h1 class="content-cell-title">{metadata.name}</h1>
    </div>
    <p class="value content-cell-details">
      {metadata.description}
    </p>
    <a href={metadata.url} target="_blank" rel="noopener noreferrer"
      >{metadata.url}</a
    >
    <div class="content-cell-details">
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
  </div>
{/if}

<style lang="scss">
  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
  }

  a {
    font-size: inherit;

    color: var(--primary);
  }
</style>
