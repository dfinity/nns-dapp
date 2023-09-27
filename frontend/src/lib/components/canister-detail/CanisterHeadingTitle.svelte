<script lang="ts">
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let canisterDetails: CanisterDetails | undefined;
  export let isController: boolean | undefined;
</script>

<TestIdWrapper testId="canister-heading-title-component">
  {#if nonNullish(canisterDetails)}
    <AmountDisplay
      amount={TokenAmount.fromE8s({
        amount: canisterDetails.cycles,
        token: { name: "cycles", symbol: $i18n.canisters.t_cycles },
      })}
      size="huge"
      singleLine
    />
    <!-- Only when we have loaded the data and we know whether the user is the controller -->
  {:else if isController === false}
    <h1 data-tid="caniter-title-balance-unavailable">
      {$i18n.canister_detail.balance_unavailable}
    </h1>
  {:else}
    <div data-tid="skeleton" class="skeleton">
      <SkeletonText tagName="h1" />
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .skeleton {
    width: 90%;

    @include media.min-width(small) {
      width: 40%;
    }
  }
</style>
