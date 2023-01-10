<script lang="ts">
  import { SkeletonText, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import SelectUniverseCard from "$lib/components/universe/SelectUniverseCard.svelte";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { nonNullish } from "$lib/utils/utils";
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
>
  {#if nonNullish($selectedProjectBalance.balance)}
    <AmountDisplay copy amount={$selectedProjectBalance.balance} />
  {:else}
    <div class="skeleton">
      <SkeletonText />
    </div>
  {/if}
</SelectUniverseCard>

{#if showProjectPicker}
  <SelectUniverseModal on:nnsClose={() => (showProjectPicker = false)} />
{/if}

<style lang="scss">
  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-4x);
    box-sizing: border-box;
    padding: var(--padding-0_5x) 0;
    max-width: 240px;
  }
</style>
