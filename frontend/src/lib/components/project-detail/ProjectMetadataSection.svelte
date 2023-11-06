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
  import type { Principal } from "@dfinity/principal";
  import { snsProjectDashboardUrl } from "$lib/utils/projects.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let summary: SnsSummary | undefined | null;
  $: summary = $projectDetailStore.summary;

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = summary?.rootCanisterId;

  let lifecycle: SnsSwapLifecycle | undefined;
  $: lifecycle = summary?.swap.lifecycle;

  let metadata: SnsSummaryMetadata | undefined;
  let token: IcrcTokenMetadata | undefined;

  $: metadata = summary?.metadata;
  $: token = summary?.token;
</script>

<TestIdWrapper testId="project-metadata-section-component">
  {#if isNullish(metadata) || isNullish(token) || isNullish(rootCanisterId)}
    <SkeletonDetails />
  {:else}
    <div data-tid="sns-project-detail-metadata" class="container">
      <div class="title">
        <Logo
          src={metadata.logo}
          alt={$i18n.sns_launchpad.project_logo}
          size="big"
        />
        <h1 class="content-cell-title" data-tid="project-name">
          {metadata.name}
        </h1>
      </div>
      <div class="metadata-wrapper">
        <p class="description">
          {metadata.description}
        </p>
        <p class="links">
          <a href={metadata.url} target="_blank" rel="noopener noreferrer"
            >{metadata.url}</a
          >
          {#if lifecycle === SnsSwapLifecycle.Committed}
            <span class="separator">|</span>
            <a
              data-tid="dashboard-link"
              href={snsProjectDashboardUrl(rootCanisterId)}
              target="_blank"
              rel="noopener noreferrer"
              class="dashboard-link"
            >
              {$i18n.sns_project_detail.link_to_dashboard}
            </a>
          {/if}
        </p>
      </div>
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  p {
    margin: 0;
  }

  .title {
    display: flex;
    gap: var(--padding-1_5x);
    align-items: center;
    margin-bottom: var(--padding-2x);
  }

  .container {
    padding: 0 0 var(--padding);
  }

  .metadata-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    .separator {
      display: none;
    }

    .dashboard-link {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }

    @include media.min-width(medium) {
      flex-direction: row;

      .separator {
        display: inline-block;
      }
    }
  }
</style>
