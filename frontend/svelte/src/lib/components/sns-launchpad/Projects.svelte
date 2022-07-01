<script lang="ts">
  import { loadSnsFullProjects } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectStore,
    type SnsFullProject,
  } from "../../stores/snsProjects.store";
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

    await loadSnsFullProjects();
    loading = false;
  };

  onMount(load);
</script>

{#if loading}
  <CardGrid>
    <!-- TODO L2-774: SkeletonProjectCard -->
    <SkeletonCard />
    <SkeletonCard />
  </CardGrid>
{:else if projects !== undefined}
  <CardGrid>
    {#each projects as project}
      <ProjectCard {project} />
    {/each}
  </CardGrid>
  {#if projects.length === 0}
    <p>{$i18n.sns_launchpad.no_projects}</p>
  {/if}
{/if}
