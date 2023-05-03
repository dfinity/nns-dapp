<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";

  export let amount: TokenAmount;
  export let estimation = false;
  export let testId: string | undefined = undefined;
</script>

<div>
  <p class="label">
    {#if estimation}
      {$i18n.accounts.received_amount_notice}
    {:else}
      {$i18n.accounts.received_amount}
    {/if}
  </p>

  <p class="no-margin" data-tid={testId} class:estimation>
    <AmountDisplay inline detailed {amount} />
  </p>
</div>

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
  }

  .estimation {
    padding: 0 0 var(--padding);
  }
</style>
