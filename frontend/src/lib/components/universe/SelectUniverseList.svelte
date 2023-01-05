<script lang="ts">
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { createEventDispatcher } from "svelte";

  export let selectedCanisterId: string;
  export let role: "link" | "button" = "link";

  const dispatch = createEventDispatcher();
</script>

{#each $selectableProjects as { canisterId, summary } (canisterId)}
  <SelectUniverseCard
    {summary}
    {role}
    selected={canisterId === selectedCanisterId}
    on:click={() => dispatch("nnsSelectProject", canisterId)}
  />
{/each}
