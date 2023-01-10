<script lang="ts">
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { createEventDispatcher } from "svelte";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";

  export let role: "link" | "button" = "link";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();

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
