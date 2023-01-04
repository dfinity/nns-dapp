<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import SelectProjectCard from "$lib/components/universe/SelectProjectCard.svelte";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { nonNullish } from "$lib/utils/utils";
  import SelectProjectModal from "$lib/modals/universe/SelectProjectModal.svelte";

  export let selectedCanisterId: string;

  export let showProjectPicker = false;

  let innerWidth = 0;

  const onWindowSizeChange = (innerWidth: number) => {
    // Close project picker modal on large screen
    if (innerWidth > 1024) {
      showProjectPicker = false;
    }
  }

  $: onWindowSizeChange(innerWidth);
</script>

<svelte:window bind:innerWidth />

<SelectProjectCard
  summary={$snsProjectSelectedStore?.summary}
  canisterId={selectedCanisterId}
  selected={true}
  icon="expand"
  on:click={() => showProjectPicker = true}
>
  {#if nonNullish($selectedProjectBalance.balance)}
    <AmountDisplay copy amount={$selectedProjectBalance.balance} />
  {:else}
    <div class="skeleton">
      <SkeletonText />
    </div>
  {/if}
</SelectProjectCard>

{#if showProjectPicker}
  <SelectProjectModal {selectedCanisterId} on:nnsClose={() => showProjectPicker = false} />
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-4x);
    box-sizing: border-box;
    padding: var(--padding-0_5x) 0;
    max-width: 240px;
  }
</style>
