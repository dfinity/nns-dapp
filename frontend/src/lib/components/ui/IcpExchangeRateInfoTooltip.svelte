<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isNullish } from "@dfinity/utils";

  export let hasError: boolean;
</script>

<div
  class="exchange-rate-info-tooltip"
  data-tid="icp-exchange-rate-info-tooltip-component"
  class:has-error={hasError}
>
  <TooltipIcon>
    {#if hasError || isNullish($tickerProviderStore)}
      {$i18n.accounts.token_price_error}
    {:else}
      <div>
        {replacePlaceholders($i18n.accounts.token_price_source, {
          $fiatProvider: $tickerProviderStore,
        })}
      </div>
    {/if}
  </TooltipIcon>
</div>

<style lang="scss">
  .exchange-rate-info-tooltip {
    &.has-error {
      --tooltip-icon-color: var(--tag-failed-text);
    }
  }
</style>
