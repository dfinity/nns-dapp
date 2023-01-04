<script lang="ts">
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import SelectProjectNavCard from "$lib/components/universe/SelectProjectCard.svelte";

  export let selectedCanisterId: string;
</script>

{#each $selectableProjects as { canisterId, summary } (canisterId)}
  <SelectProjectNavCard
    {summary}
    {canisterId}
    selected={canisterId === selectedCanisterId}
    on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
  />
{/each}
