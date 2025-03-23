<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, type TokenAmount, TokenAmountV2 } from "@dfinity/utils";

  export let transactionFee: TokenAmount | TokenAmountV2;

  let ledgerCanisterId: Principal | undefined;
  $: ledgerCanisterId = getLedgerCanisterIdFromUniverse($selectedUniverseStore);

  let tokenPrice: number | undefined;
  $: tokenPrice =
    nonNullish(ledgerCanisterId) &&
    nonNullish($icpSwapUsdPricesStore) &&
    $icpSwapUsdPricesStore !== "error"
      ? $icpSwapUsdPricesStore[ledgerCanisterId.toText()]
      : undefined;

  let usdValue: number;
  $: usdValue = getUsdValue({ amount: transactionFee, tokenPrice }) ?? 0;

  let isAlmostZero: boolean;
  $: isAlmostZero = usdValue > 0 && usdValue < 0.01;

  let formattedUsdValue: string;
  $: formattedUsdValue = isAlmostZero ? "0.01" : formatNumber(usdValue);

  let usdValueDisplay: string;
  $: usdValueDisplay = `(${isAlmostZero ? "< " : ""}$${formattedUsdValue})`;
</script>

<div data-tid="transaction-form-fee">
  <p class="fee label no-margin">
    <slot name="label">{$i18n.accounts.transaction_fee}</slot>
  </p>

  <p class="value">
    <AmountDisplay amount={transactionFee} singleLine />
    <span class="usd-value" data-tid="transaction-form-fee-usd-value">
      {usdValueDisplay}
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
