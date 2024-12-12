<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { formatNumber } from "$lib/utils/format.utils";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import { TokenAmountV2 } from "@dfinity/utils";
  import { nonNullish } from "@dfinity/utils";

  export let amount: TokenAmountV2 | UnavailableTokenAmount;
  export let amountInUsd: number | undefined;
</script>

<div class="values" data-tid="amount-with-usd-component">
  <AmountDisplay singleLine {amount} />
  <span data-tid="usd-value" class="usd-value">
    {#if nonNullish(amountInUsd)}
      ${formatNumber(amountInUsd)}
    {:else}
      $-/-
    {/if}
  </span>
</div>

<style lang="scss">
  .values {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    align-items: flex-end;

    .usd-value {
      color: var(--text-description);
      font-size: var(--font-size-small);
    }
  }
</style>
