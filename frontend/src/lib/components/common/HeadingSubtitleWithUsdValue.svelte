<script lang="ts">
  import HeadingSubtitle from "$lib/components/common/HeadingSubtitle.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
  import { i18n } from "$lib/stores/i18n";
  import { tickersStore } from "$lib/stores/tickers.store";
  import { formatNumber } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isNullish, nonNullish, type TokenAmountV2 } from "@dfinity/utils";
  import type { Principal } from "@icp-sdk/core/principal";

  export let amount: TokenAmountV2 | undefined = undefined;
  export let ledgerCanisterId: Principal | undefined;

  let icpSwapHasError: boolean;
  $: icpSwapHasError = $tickersStore === "error";

  let tokenPrice: number | undefined;
  $: tokenPrice =
    nonNullish(ledgerCanisterId) &&
    nonNullish($tickersStore) &&
    $tickersStore !== "error"
      ? $tickersStore[ledgerCanisterId.toText()]
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
        {#if icpSwapHasError || isNullish($tickerProviderStore)}
          {$i18n.accounts.token_price_error}
        {:else}
          {replacePlaceholders($i18n.accounts.token_price_source, {
            $fiatProvider: $tickerProviderStore,
          })}
        {/if}
      </TooltipIcon>
    </div>
    <div class="vertical-divider"></div>
    <div data-tid="slot">
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
