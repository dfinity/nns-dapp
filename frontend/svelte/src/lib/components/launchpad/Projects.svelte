<script lang="ts">
  import {
    loadSnsSummaries,
    loadSnsSwapStates,
  } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectStore,
    type SnsFullProject,
    snsSummariesStore,
    snsesCountStore,
  } from "../../stores/projects.store";
  import { onMount } from "svelte";
  import ProjectCard from "./ProjectCard.svelte";
  import CardGrid from "../ui/CardGrid.svelte";
  import SkeletonProjectCard from "../ui/SkeletonProjectCard.svelte";
  import Spinner from "../ui/Spinner.svelte";

  let loading: boolean = false;
  let projects: SnsFullProject[] | undefined;
  $: projects = $snsFullProjectStore;

  let projectCount: number | undefined;
  $: projectCount = $snsesCountStore;

  const load = async () => {
    // show loading state only when store is empty
    loading = $snsFullProjectStore === undefined;

    // TODO(L2-838): reload store only if needed
    await loadSnsSummaries();

    loading = false;
  };

  onMount(load);

  // TODO: do we want such subscribe in the component?
  $: loadSnsSwapStates($snsSummariesStore.summaries);
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
    <p>{$i18n.sns_launchpad.no_projects}</p>
  {/if}
{/if}

<style lang="scss">
  // match page spinner
  div {
    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }
</style>
