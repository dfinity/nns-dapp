<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import ProjectCard from "./ProjectCard.svelte";
  import SkeletonProjectCard from "../ui/SkeletonProjectCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { isNullish } from "../../utils/utils";
  import {
    snsesCountStore,
    snsSummariesStore,
    snsSwapCommitmentsStore,
  } from "../../stores/sns.store";
  import {
    activePadProjectsStore,
    type SnsFullProject,
  } from "../../stores/projects.store";

  let projects: SnsFullProject[] | undefined;
  $: projects = $activePadProjectsStore;

  let projectCount: number | undefined;
  $: projectCount = $snsesCountStore;

  let loading: boolean = false;
  $: loading =
    isNullish($snsSummariesStore) || isNullish($snsSwapCommitmentsStore);
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
    <p class="no-projects">{$i18n.sns_launchpad.no_projects}</p>
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
