<script lang="ts">
  import { nonNullish } from "$lib/utils/utils";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
</script>

{#if nonNullish($selectedProjectBalance.balance)}
  <AmountDisplay copy amount={$selectedProjectBalance.balance} />
{:else}
  <div class="skeleton">
    <SkeletonText />
  </div>
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