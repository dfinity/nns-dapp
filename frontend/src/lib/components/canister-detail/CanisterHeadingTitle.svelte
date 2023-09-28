<script lang="ts">
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let details: CanisterDetails | undefined;
  export let isController: boolean | undefined;
</script>

<TestIdWrapper testId="canister-heading-title-component">
  {#if nonNullish(details)}
    <AmountDisplay
      amount={TokenAmount.fromE8s({
        amount: details.cycles,
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

  h1 {
    margin: 0;
  }

  .skeleton {
    // This is a width for the skeleton that looks good on desktop and mobile.
    width: 300px;
    max-width: 90%;
  }
</style>
