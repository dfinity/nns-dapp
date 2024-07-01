<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import SelectUniverseModal from "$lib/modals/universe/SelectUniverseModal.svelte";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";

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
