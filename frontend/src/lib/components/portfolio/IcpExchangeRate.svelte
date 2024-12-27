<script lang="ts">
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let hasError: boolean;

  let icpPrice: number | undefined;
  $: icpPrice =
    isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error"
      ? undefined
      : $icpSwapUsdPricesStore[LEDGER_CANISTER_ID.toText()];

  let icpPriceFormatted: string;
  $: icpPriceFormatted = nonNullish(icpPrice)
    ? formatNumber(icpPrice)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;
</script>

<div class="exchange-rate">
  <img
    src={IC_LOGO_ROUNDED}
    alt={$i18n.auth.ic_logo}
    class="icp-icon desktop-only"
  />
  <span class="desktop-only">
    1 {$i18n.core.icp} = $<span data-tid="icp-price">{icpPriceFormatted}</span>
  </span>
  <TooltipIcon>
    {#if hasError}
      {$i18n.accounts.token_price_error}
    {:else}
      <div class="mobile-only">
        1 {$i18n.core.icp} = ${icpPriceFormatted}
      </div><div>
        {$i18n.accounts.token_price_source}
      </div>
    {/if}
  </TooltipIcon>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .exchange-rate {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .icp-icon {
      width: 20px;
      height: 20px;
    }
  }

  .desktop-only {
    display: none;
  }

  @include media.min-width(medium) {
    .desktop-only {
      display: initial;
    }
    .mobile-only {
      display: none;
    }
  }
</style>
