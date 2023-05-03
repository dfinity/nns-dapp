<script lang="ts">
  import type { SnsSummary, SnsSummaryMetadata } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import { isNullish } from "@dfinity/utils";
  import SkeletonDetails from "$lib/components/ui/SkeletonDetails.svelte";
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

<TestIdWrapper testId="project-metadata-section-component">
  {#if isNullish(metadata) || isNullish(token)}
    <SkeletonDetails />
  {:else}
    <div data-tid="sns-project-detail-metadata">
      <div class="title">
        <Logo src={metadata.logo} alt={$i18n.sns_launchpad.project_logo} />
        <h1 class="content-cell-title" data-tid="project-name">
          {metadata.name}
        </h1>
      </div>
      <a href={metadata.url} target="_blank" rel="noopener noreferrer"
        >{metadata.url}</a
      >
      <p class="description content-cell-details">
        {metadata.description}
      </p>
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding-2x);
  }

  p {
    margin-top: var(--padding);
  }
</style>
