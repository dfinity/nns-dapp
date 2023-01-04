<script lang="ts">
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import SelectProjectCard from "$lib/components/universe/SelectProjectCard.svelte";

  export let selectedCanisterId: string;
  export let icon: "expand" | "check" | undefined = undefined;
</script>

{#each $selectableProjects as { canisterId, summary } (canisterId)}
  <SelectProjectCard
    {summary}
    {canisterId}
    {icon}
    selected={canisterId === selectedCanisterId}
    on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
  />
{/each}
