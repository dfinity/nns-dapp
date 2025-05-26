<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import { formatNumber } from "$lib/utils/format.utils";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import { nonNullish, TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    amount: TokenAmountV2 | UnavailableTokenAmount;
    amountInUsd: number | undefined;
  };

  const { amount, amountInUsd }: Props = $props();

  const formattedValue = $derived(
    nonNullish(amountInUsd) ? formatNumber(amountInUsd) : "-/-"
  );
</script>

<div class="values" data-tid="amount-with-usd-component">
  <AmountDisplay singleLine {amount} hideValue={true} />
  <span data-tid="usd-value" class="usd-value">
    $<PrivacyAwareAmount value={formattedValue} length={3} />
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
