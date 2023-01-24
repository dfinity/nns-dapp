<script lang="ts">
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { createEventDispatcher } from "svelte";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";

  export let role: "link" | "button" = "link";

  let selectedCanisterId: string;
  $: selectedCanisterId = $selectedUniverseIdStore.toText();

  const dispatch = createEventDispatcher();
</script>

{#each $selectableUniversesStore as universe (universe.canisterId)}
  <SelectUniverseCard
    {universe}
    {role}
    selected={universe.canisterId === selectedCanisterId}
    on:click={() => dispatch("nnsSelectUniverse", universe.canisterId)}
  />
{/each}
