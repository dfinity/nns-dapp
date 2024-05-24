<script lang="ts">
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SelectUniverseModal from "$lib/modals/universe/SelectUniverseModal.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { ENABLE_ACTIONABLE_TAB } from "$lib/stores/feature-flags.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { AppPath } from "$lib/constants/routes.constants";

  let showProjectPicker = false;

  let innerWidth = 0;

  const onWindowSizeChange = (innerWidth: number) => {
    // Close project picker modal on large screen
    if (innerWidth > BREAKPOINT_LARGE) {
      showProjectPicker = false;
    }
  };

  $: onWindowSizeChange(innerWidth);

  let isActionableSelected = false;
  $: isActionableSelected =
    $ENABLE_ACTIONABLE_TAB &&
    $authSignedInStore &&
    $pageStore.path === AppPath.Proposals &&
    $pageStore.actionable;
</script>

<svelte:window bind:innerWidth />

<TestIdWrapper testId="select-universe-dropdown-component">
  <SelectUniverseCard
    universe={isActionableSelected ? "all-actionable" : $selectedUniverseStore}
    selected={true}
    role="dropdown"
    on:click={() => (showProjectPicker = true)}
  />

  {#if showProjectPicker}
    <SelectUniverseModal on:nnsClose={() => (showProjectPicker = false)} />
  {/if}
</TestIdWrapper>
