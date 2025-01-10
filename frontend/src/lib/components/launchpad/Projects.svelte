<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
  import SkeletonProjectCard from "$lib/components/ui/SkeletonProjectCard.svelte";
  import {
    snsProjectsActivePadStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import { isLoadingSnsProjectsStore } from "$lib/stores/sns.store";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { Html } from "@dfinity/gix-components";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  export let testId: string;
  export let status: SnsSwapLifecycle;

  let projects: SnsFullProject[];
  $: projects = filterProjectsStatus({
    swapLifecycle: status,
    projects: $snsProjectsActivePadStore,
  }).sort(comparesByDecentralizationSaleOpenTimestampDesc);

  let loading = false;
  $: loading = $isLoadingSnsProjectsStore;

  const mapper: Record<SnsSwapLifecycle, string> = {
    [SnsSwapLifecycle.Open]: $i18n.sns_launchpad.no_open_projects,
    [SnsSwapLifecycle.Adopted]: $i18n.sns_launchpad.no_opening_soon_projects,
    [SnsSwapLifecycle.Committed]: $i18n.sns_launchpad.no_committed_projects,
    [SnsSwapLifecycle.Unspecified]: $i18n.sns_launchpad.no_projects,
    [SnsSwapLifecycle.Aborted]: $i18n.sns_launchpad.no_projects,
    [SnsSwapLifecycle.Pending]: $i18n.sns_launchpad.no_projects,
  };
  let noProjectsMessageLabel: string;
  $: noProjectsMessageLabel = mapper[status];
</script>

<TestIdWrapper {testId}>
  {#if loading}
    <div class="card-grid">
      <SkeletonProjectCard />
      <SkeletonProjectCard />
      <SkeletonProjectCard />
    </div>
  {:else}
    <div class="card-grid">
      {#each projects as project (project.rootCanisterId.toText())}
        <ProjectCard {project} />
      {/each}
    </div>
    {#if projects.length === 0}
      <p data-tid="no-projects-message" class="no-projects description">
        <Html text={noProjectsMessageLabel} />
      </p>
    {/if}
  {/if}
</TestIdWrapper>

<style lang="scss">
  // match page spinner
  div {
    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }

  .no-projects {
    margin: 0 0 var(--padding-2x);
  }
</style>
