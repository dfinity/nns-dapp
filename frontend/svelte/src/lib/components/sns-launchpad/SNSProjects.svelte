<script lang="ts">
  import { loadSnsFullProjects } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectStore,
    type SnsFullProject,
  } from "../../stores/snsProjects.store";
  import { onMount } from "svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import SnsProject from "./SNSProject.svelte";

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

<h2>{$i18n.sns_launchpad.projects}</h2>

{#if loading}
  <SkeletonCard />
  <SkeletonCard />
{:else if projects !== undefined}
  {#each projects as project}
    <SnsProject {project} />
  {/each}

  {#if projects.length === 0}
    <p>{$i18n.sns_launchpad.no_projects}</p>
  {/if}
{/if}
