<script lang="ts">
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import SelectUniverseModal from "$lib/modals/universe/SelectUniverseModal.svelte";

  let showProjectPicker = false;

  let innerWidth = 0;

  const onWindowSizeChange = (innerWidth: number) => {
    // Close project picker modal on large screen
    if (innerWidth > BREAKPOINT_LARGE) {
      showProjectPicker = false;
    }
  };

  $: onWindowSizeChange(innerWidth);
</script>

<svelte:window bind:innerWidth />

<SelectUniverseCard
  summary={$snsProjectSelectedStore?.summary}
  selected={true}
  role="dropdown"
  on:click={() => (showProjectPicker = true)}
 />

{#if showProjectPicker}
  <SelectUniverseModal on:nnsClose={() => (showProjectPicker = false)} />
{/if}

