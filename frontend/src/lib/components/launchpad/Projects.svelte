<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ProjectCard from "./ProjectCard.svelte";
  import SkeletonProjectCard from "$lib/components/ui/SkeletonProjectCard.svelte";
  import { isNullish } from "$lib/utils/utils";
  import {
    snsSummariesStore,
    snsSwapCommitmentsStore,
  } from "$lib/stores/sns.store";
  import {
    activePadProjectsStore,
    type SnsFullProject,
  } from "$lib/stores/projects.store";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { filterProjectsStatus } from "$lib/utils/projects.utils";

  export let status: SnsSwapLifecycle;

  let projects: SnsFullProject[] | undefined;
  $: projects = filterProjectsStatus({
    swapLifecycle: status,
    projects: $activePadProjectsStore,
  });

  let loading = false;
  $: loading =
    isNullish($snsSummariesStore) || isNullish($snsSwapCommitmentsStore);

  let noProjectsMessage: string;
  $: noProjectsMessage =
    status === SnsSwapLifecycle.Committed
      ? $i18n.sns_launchpad.no_committed_projects
      : $i18n.sns_launchpad.no_open_projects;
</script>

{#if loading || projects === undefined}
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
    <p class="no-projects">{noProjectsMessage}</p>
  {/if}
{/if}

<style lang="scss">
  // match page spinner
  div {
    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }

  .no-projects {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
