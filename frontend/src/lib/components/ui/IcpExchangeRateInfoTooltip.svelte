<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { i18n } from "$lib/stores/i18n";

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
        {$i18n.accounts.token_price_source}
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
