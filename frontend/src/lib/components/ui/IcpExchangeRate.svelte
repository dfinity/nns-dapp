<script lang="ts">
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { nonNullish } from "@dfinity/utils";

  export let icpPrice: number | undefined;
  export let hasError: boolean;
  export let absentValue: string = PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let icpPriceFormatted: string;
  $: icpPriceFormatted = nonNullish(icpPrice)
    ? formatNumber(icpPrice)
    : absentValue;
</script>

<div
  class="exchange-rate"
  data-tid="icp-exchange-rate-component"
  class:has-error={hasError}
>
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

    &.has-error {
      --tooltip-icon-color: var(--tag-failed-text);
    }
  }

  .desktop-only {
    display: none;
  }
  @include media.min-width(medium) {
    .desktop-only {
      display: flex;
    }
    .mobile-only {
      display: none;
    }
  }
</style>
