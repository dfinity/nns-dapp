<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { tickersProviderName } from "$lib/derived/tickers-provider-name.derived";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let hasError: boolean;
</script>

<div
  class="exchange-rate-info-tooltip"
  data-tid="icp-exchange-rate-info-tooltip-component"
  class:has-error={hasError}
>
  <TooltipIcon>
    {#if hasError}
      {$i18n.accounts.token_price_error}
    {:else}
      <div>
        {replacePlaceholders($i18n.accounts.token_price_source, {
          $fiatProvider: $tickersProviderName,
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
