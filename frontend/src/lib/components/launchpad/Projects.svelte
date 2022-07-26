<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import {
    activePadProjectsStore,
    type SnsFullProject,
    snsesCountStore,
    snsSummariesStore,
    snsSwapCommitmentsStore,
  } from "../../stores/projects.store";
  import ProjectCard from "./ProjectCard.svelte";
  import CardGrid from "../ui/CardGrid.svelte";
  import SkeletonProjectCard from "../ui/SkeletonProjectCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { isNullish } from "../../utils/utils";

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
    <CardGrid>
      {#each Array(projectCount) as _}
        <SkeletonProjectCard />
      {/each}
    </CardGrid>
  {/if}
{:else if projects !== undefined}
  <CardGrid>
    {#each projects as project (project.rootCanisterId.toText())}
      <ProjectCard {project} />
    {/each}
  </CardGrid>
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
