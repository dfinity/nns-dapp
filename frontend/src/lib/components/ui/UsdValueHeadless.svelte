<script lang="ts">
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { formatCurrencyNumber, formatNumber } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { Component } from "svelte";

  type Props = {
    absentValue?: string;
    children: Component;
    hasUnpricedTokens: boolean;
    usdAmount: number | undefined;
  };

  const {
    usdAmount,
    hasUnpricedTokens = false,
    absentValue = PRICE_NOT_AVAILABLE_PLACEHOLDER,
    children,
  }: Props = $props();

  const hasError = $derived($icpSwapUsdPricesStore === "error");
  const hasPrices = $derived(!hasError && nonNullish($icpSwapUsdPricesStore));
  const hasPricesAndUnpricedTokens = $derived(hasPrices && hasUnpricedTokens);

  const usdAmountFormatted = $derived(
    nonNullish(usdAmount) && hasPrices
      ? formatCurrencyNumber(usdAmount)
      : absentValue
  );
  const icpPrice = $derived(
    isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error"
      ? undefined
      : $icpSwapUsdPricesStore[LEDGER_CANISTER_ID.toText()]
  );

  const icpAmount = $derived(
    nonNullish(usdAmount) && nonNullish(icpPrice)
      ? usdAmount / icpPrice
      : undefined
  );
  const icpAmountFormatted = $derived(
    nonNullish(icpAmount) ? formatNumber(icpAmount) : absentValue
  );
</script>

{@render children({
  icpPrice,
  usdAmountFormatted,
  icpAmountFormatted,
  hasPricesAndUnpricedTokens,
  hasError,
})}
