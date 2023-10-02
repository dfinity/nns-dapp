<script lang="ts">
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";

  export let details: CanisterDetails | undefined;
  export let canister: CanisterInfo;
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
      {#if canister.name.length === 0}
        {shortenWithMiddleEllipsis(canister.canister_id.toText())}
      {:else}
        {canister.name}
      {/if}
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
    // Based on $breakpoint-xsmall: 320px;
    width: 320px;
    max-width: calc(100% - var(--padding-2x));
  }
</style>
