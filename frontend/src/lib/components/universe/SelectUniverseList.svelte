<script lang="ts">
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { createEventDispatcher } from "svelte";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { ENABLE_ACTIONABLE_TAB } from "$lib/stores/feature-flags.store";
  import { pageStore } from "$lib/derived/page.derived";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";

  export let role: "link" | "button" = "link";

  const dispatch = createEventDispatcher();

  $: selectedUniverse =
    $ENABLE_ACTIONABLE_TAB && $authSignedInStore && $pageStore.actionable
      ? "all-actionable"
      : $selectedUniverseIdStore.toText();
</script>

<TestIdWrapper testId="select-universe-list-component">
  {#if $ENABLE_ACTIONABLE_TAB && $authSignedInStore && $pageStore.path === AppPath.Proposals}
    <SelectUniverseCard
      on:click={() => dispatch("nnsSelectActionable")}
      selected={"all-actionable" === selectedUniverse}
      universe="all-actionable"
    />
    <Separator spacing="medium" testId="all-actionable-separator" />
  {/if}

  {#each $selectableUniversesStore as universe (universe.canisterId)}
    <SelectUniverseCard
      {universe}
      {role}
      selected={universe.canisterId === selectedUniverse}
      on:click={() => dispatch("nnsSelectUniverse", universe.canisterId)}
    />
  {/each}
</TestIdWrapper>
