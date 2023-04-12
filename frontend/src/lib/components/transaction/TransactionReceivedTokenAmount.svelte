<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";

  export let amount: TokenAmount;
  export let estimation = false;
  export let testId: string | undefined = undefined;
</script>

<div data-tid={testId}>
  <p class="label">
    {#if estimation}
      {$i18n.accounts.estimated_amount_received}
    {:else}
      {$i18n.accounts.received_amount}
    {/if}
  </p>

  <p class="no-margin">
    {#if estimation}<span class="value">≈</span>{/if}<AmountDisplay inline detailed {amount} />
  </p>
</div>

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
  }
</style>
