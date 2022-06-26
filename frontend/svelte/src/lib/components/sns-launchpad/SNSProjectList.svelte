<script lang="ts">
  import type { SnsFullProject } from "../../stores/snsProjects.store";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import SnsProject from "./SNSProject.svelte";

  export let projects: SnsFullProject[] | undefined = undefined;
  export let title: string;
  export let loading: boolean = false;

  let hidden: boolean;
  $: hidden = projects?.length === 0;
</script>

{#if !hidden}
  <h2>{title}</h2>

  {#if loading}
    <SkeletonCard />
    <SkeletonCard />
  {:else if projects !== undefined}
    {#each projects as project}
      <SnsProject {project} />
    {/each}
  {/if}
{/if}
