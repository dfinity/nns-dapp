<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import {
    getLedgerCanisterIdFromToken,
    getUsdValue,
  } from "$lib/utils/token.utils";
  import {
    isNullish,
    nonNullish,
    type TokenAmount,
    type TokenAmountV2,
  } from "@dfinity/utils";

  type Props = {
    amount: TokenAmountV2 | TokenAmount;
    estimation?: boolean;
    testId?: string;
    withDollarValue?: boolean;
  };
  const {
    amount,
    estimation = false,
    testId,
    withDollarValue = false,
  }: Props = $props();

  const tokenPrice = $derived.by(() => {
    const ledgerCanisterId = getLedgerCanisterIdFromToken(
      amount.token,
      $tokensByLedgerCanisterIdStore
    );

    if (
      isNullish(ledgerCanisterId) ||
      isNullish($icpSwapUsdPricesStore) ||
      $icpSwapUsdPricesStore === "error"
    )
      return undefined;

    return $icpSwapUsdPricesStore[ledgerCanisterId];
  });

  const usdValue = $derived.by(() => {
    if (isNullish(amount) || isNullish(tokenPrice)) return undefined;

    const usdValue = getUsdValue({ amount, tokenPrice });
    return nonNullish(usdValue) ? formatNumber(usdValue) : undefined;
  });
</script>

<div>
  <p class="label">
    {#if estimation}
      {$i18n.accounts.received_amount_notice}
    {:else}
      {$i18n.accounts.received_amount}
    {/if}
  </p>

  <p class="no-margin value" data-tid={testId} class:estimation>
    <AmountDisplay inline detailed {amount} />
    {#if withDollarValue && nonNullish(usdValue)}
      <span class="fiat" data-tid="fiat-value">
        (~${usdValue})
      </span>
    {/if}
  </p>
</div>

<style lang="scss">
  .value {
    margin: 0 0 var(--padding-0_5x);

    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .fiat {
      color: var(--text-description);
    }
  }

  .estimation {
    padding: 0 0 var(--padding-0_5x);
  }
</style>
