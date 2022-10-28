<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ProjectCard from "./ProjectCard.svelte";
  import SkeletonProjectCard from "$lib/components/ui/SkeletonProjectCard.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { isNullish } from "$lib/utils/utils";
  import {
    snsesCountStore,
    snsSummariesStore,
    snsSwapCommitmentsStore,
  } from "$lib/stores/sns.store";
  import {
    activePadProjectsStore,
    type SnsFullProject,
  } from "$lib/stores/projects.store";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { filterProjectsStatus } from "$lib/utils/projects.utils";

  export let status: "Committed" | "Open";

  let projects: SnsFullProject[] | undefined;
  $: projects = filterProjectsStatus({
    swapLifecycle:
      status === "Committed"
        ? SnsSwapLifecycle.Committed
        : SnsSwapLifecycle.Open,
    projects: $activePadProjectsStore,
  });

  let projectCount: number | undefined;
  $: projectCount = $snsesCountStore;

  let loading = false;
  $: loading =
    isNullish($snsSummariesStore) || isNullish($snsSwapCommitmentsStore);

  let noProjectsMessage: string;
  $: noProjectsMessage =
    status === "Committed"
      ? $i18n.sns_launchpad.no_committed_projects
      : $i18n.sns_launchpad.no_open_projects;
</script>

{#if loading}
  {#if projectCount === undefined}
    <div>
      <Spinner inline />
    </div>
  {:else}
    <div class="card-grid">
      {#each Array(projectCount) as _}
        <SkeletonProjectCard />
      {/each}
    </div>
  {/if}
{:else if projects !== undefined}
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
