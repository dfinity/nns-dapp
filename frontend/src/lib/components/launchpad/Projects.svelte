<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ProjectCard from "./ProjectCard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SkeletonProjectCard from "$lib/components/ui/SkeletonProjectCard.svelte";
  import { keyOf } from "$lib/utils/utils";
  import { snsQueryStoreIsLoading } from "$lib/stores/sns.store";
  import {
    snsProjectsActivePadStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { filterProjectsStatus } from "$lib/utils/projects.utils";
  import { Html } from "@dfinity/gix-components";

  export let testId: string;
  export let status: SnsSwapLifecycle;

  let projects: SnsFullProject[];
  $: projects = filterProjectsStatus({
    swapLifecycle: status,
    projects: $snsProjectsActivePadStore,
  });

  let loading = false;
  $: loading = $snsQueryStoreIsLoading;

  const mapper: Record<SnsSwapLifecycle, string> = {
    [SnsSwapLifecycle.Open]: "no_open_projects",
    [SnsSwapLifecycle.Adopted]: "no_opening_soon_projects",
    [SnsSwapLifecycle.Committed]: "no_committed_projects",
    [SnsSwapLifecycle.Unspecified]: "no_projects",
    [SnsSwapLifecycle.Aborted]: "no_projects",
    [SnsSwapLifecycle.Pending]: "no_projects",
  };
  let noProjectsMessageLabel: string;
  $: noProjectsMessageLabel = keyOf({
    obj: $i18n.sns_launchpad,
    key: mapper[status],
  });
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
