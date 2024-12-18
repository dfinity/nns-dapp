<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, type TokenAmountV2 } from "@dfinity/utils";

  export let amount: TokenAmountV2 | undefined = undefined;
  export let ledgerCanisterId: Principal | undefined;

  let icpSwapHasError: boolean;
  $: icpSwapHasError = $icpSwapUsdPricesStore === "error";

  let tokenPrice: number | undefined;
  $: tokenPrice =
    nonNullish(ledgerCanisterId) &&
    nonNullish($icpSwapUsdPricesStore) &&
    $icpSwapUsdPricesStore !== "error"
      ? $icpSwapUsdPricesStore[ledgerCanisterId.toText()]
      : undefined;

  let amountInUsd: number | undefined;
  $: amountInUsd =
    nonNullish(amount) && nonNullish(tokenPrice)
      ? (tokenPrice * Number(amount.toE8s())) / 100_000_000
      : undefined;

  let formattedAmountInUsd: string;
  $: formattedAmountInUsd = nonNullish(amountInUsd)
    ? `$${formatNumber(amountInUsd)}`
    : "$-/-";
</script>

<HeadingSubtitle testId="heading-subtitle-with-usd-value-component">
  <div class="subtitle">
    <div class="usd-value" class:icp-swap-has-error={icpSwapHasError}>
      <span data-tid="usd-value">
        {formattedAmountInUsd}
      </span>
      <TooltipIcon>
        {#if icpSwapHasError}
          {$i18n.accounts.token_price_error}
        {:else}
          {$i18n.accounts.token_price_source}
        {/if}
      </TooltipIcon>
    </div>
    <div class="vertical-divider"></div>
    <div>
      <slot />
    </div>
  </div>
</HeadingSubtitle>

<style lang="scss">
  .subtitle {
    display: flex;
    gap: var(--padding-2x);

    .usd-value {
      display: flex;
      gap: var(--padding-0_5x);
      align-items: center;

      &.icp-swap-has-error {
        --tooltip-icon-color: var(--tag-failed-text);
      }
    }

    .vertical-divider {
      border-right: 1px solid var(--elements-divider);
    }
  }
</style>
