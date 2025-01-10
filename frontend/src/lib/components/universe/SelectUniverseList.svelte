<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { createEventDispatcher } from "svelte";

  export let role: "link" | "button" = "link";

  const dispatch = createEventDispatcher();

  $: selectedUniverse =
    $authSignedInStore && $pageStore.actionable
      ? "all-actionable"
      : $selectedUniverseIdStore.toText();
</script>

<TestIdWrapper testId="select-universe-list-component">
  {#if $authSignedInStore && $pageStore.path === AppPath.Proposals}
    <SelectUniverseCard
      on:click={() => dispatch("nnsSelectActionable")}
      selected={"all-actionable" === selectedUniverse}
      universe="all-actionable"
    />
    <Separator spacing="medium" testId="all-actionable-separator" />
  {/if}

  {#each $selectableUniversesStore as universe (universe.canisterId)}
    {#if universe.canisterId !== CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID}
      <SelectUniverseCard
        {universe}
        {role}
        selected={universe.canisterId === selectedUniverse}
        on:click={() => dispatch("nnsSelectUniverse", universe.canisterId)}
      />
    {/if}
  {/each}
</TestIdWrapper>
