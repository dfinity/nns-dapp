<script lang="ts">
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { createEventDispatcher } from "svelte";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { ENABLE_ACTIONABLE_TAB } from "$lib/stores/feature-flags.store";
  import { pageStore } from "$lib/derived/page.derived";
  import SelectActionableCard from "$lib/components/universe/SelectActionableCard.svelte";
  import { displaySelectActionableLink } from "$lib/derived/actionable-proposals.derived";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let role: "link" | "button" = "link";

  let selectedCanisterId: string;
  $: selectedCanisterId = $selectedUniverseIdStore.toText();

  const dispatch = createEventDispatcher();
</script>

<TestIdWrapper testId="select-universe-list-component">
  {#if $ENABLE_ACTIONABLE_TAB && $displaySelectActionableLink}
    <SelectActionableCard
      on:click={() => dispatch("nnsSelectActionable")}
      selected={$pageStore.actionable}
    />
    <Separator spacing="medium" />
  {/if}

  {#each $selectableUniversesStore as universe (universe.canisterId)}
    <SelectUniverseCard
      {universe}
      {role}
      selected={!($ENABLE_ACTIONABLE_TAB && $pageStore.actionable) &&
        universe.canisterId === selectedCanisterId}
      on:click={() => dispatch("nnsSelectUniverse", universe.canisterId)}
    />
  {/each}
</TestIdWrapper>
