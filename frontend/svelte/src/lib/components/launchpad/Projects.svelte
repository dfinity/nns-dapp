<script lang="ts">
  import {
    loadSnsSummaries,
    loadSnsSwapStates,
  } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectStore,
    type SnsFullProject, snsSummariesStore,
  } from "../../stores/projects.store";
  import { onMount } from "svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import ProjectCard from "./ProjectCard.svelte";
  import CardGrid from "../ui/CardGrid.svelte";

  let loading: boolean = false;
  let projects: SnsFullProject[] | undefined;
  $: projects = $snsFullProjectStore;

  const load = async () => {
    // show loading state only when store is empty
    loading = $snsFullProjectStore === undefined;

    // TODO: reload store only if needed
    await loadSnsSummaries();

    loading = false;
  };

  onMount(load);

  // TODO: do we want such subscribe in the component?
  $: loadSnsSwapStates($snsSummariesStore.summaries);
</script>

{#if loading}
  <CardGrid>
    <!-- TODO L2-774: SkeletonProjectCard -->
    <SkeletonCard />
    <SkeletonCard />
  </CardGrid>
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
