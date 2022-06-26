<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { SnsFullProject } from "../../stores/snsProjects.store";
  import Card from "../ui/Card.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";

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
    {#each projects as { summary: { logo, name, description } }}
      <Card role="link">
        <div slot="start">
          <img src={logo} alt="project logo" />
          <h3>{$i18n.sns_launchpad.project} {name}</h3>
        </div>
        <p>{description}</p>
      </Card>
    {/each}
  {/if}
{/if}
