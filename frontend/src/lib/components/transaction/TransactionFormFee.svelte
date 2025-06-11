<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue } from "$lib/utils/format.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
  import { isNullish, type TokenAmount, TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    transactionFee: TokenAmount | TokenAmountV2;
  };
  const { transactionFee }: Props = $props();

  const usdValueDisplay = $derived.by(() => {
    const ledgerCanisterId = getLedgerCanisterIdFromUniverse(
      $selectedUniverseStore
    );

    if (isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error")
      return 0;

    const tokenPrice = $icpSwapUsdPricesStore[ledgerCanisterId.toText()];
    const usdValue = getUsdValue({ amount: transactionFee, tokenPrice }) ?? 0;
    return formatUsdValue(usdValue);
  });
</script>

<div data-tid="transaction-form-fee">
  <p class="fee label no-margin">
    {$i18n.accounts.transaction_fee}
  </p>

  <p class="value">
    <AmountDisplay amount={transactionFee} singleLine />
    <span class="usd-value" data-tid="transaction-form-fee-usd-value">
      ({usdValueDisplay})
    </span>
  </p>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .fee {
    padding: var(--padding-0_5x) 0;
    color: var(--text-description);
    @include fonts.small();
  }

  .value {
    margin: 0;

    --amount-weight: var(--font-weight-bold);

    .usd-value {
      color: var(--text-description);
    }
  }
</style>
