<script lang="ts">
  import { SkeletonText } from "@dfinity/gix-components";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import SelectProjectNavCard from "$lib/components/universe/SelectProjectCard.svelte";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { nonNullish } from "$lib/utils/utils";

  export let selectedCanisterId: string;
</script>

<SelectProjectNavCard
  summary={$snsProjectSelectedStore?.summary}
  canisterId={selectedCanisterId}
  selected={true}
  expandMoreIcon
>
  {#if nonNullish($selectedProjectBalance.balance)}
    <AmountDisplay copy amount={$selectedProjectBalance.balance} />
  {:else}
    <div class="skeleton">
      <SkeletonText />
    </div>
  {/if}
</SelectProjectNavCard>

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
