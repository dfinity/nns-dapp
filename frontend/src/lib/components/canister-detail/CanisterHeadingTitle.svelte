<script lang="ts">
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";

  export let canisterDetails: CanisterDetails | undefined;
  export let controller: boolean | undefined;
</script>

{#if controller === undefined}
  <div class="skeleton">
    <SkeletonText tagName="h1" />
  </div>
{:else if !controller}
  <h1>Balance unavailable</h1>
{:else if nonNullish(canisterDetails)}
  <AmountDisplay
    amount={TokenAmount.fromE8s({
      amount: canisterDetails.cycles,
      token: { name: "cycles", symbol: $i18n.canisters.t_cycles },
    })}
    size="huge"
    singleLine
  />
{:else}
  <div class="skeleton">
    <SkeletonText tagName="h1" />
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .skeleton {
    width: 90%;

    @include media.min-width(small) {
      width: 40%;
    }
  }
</style>
