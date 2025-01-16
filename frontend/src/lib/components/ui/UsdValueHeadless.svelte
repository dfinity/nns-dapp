<script lang="ts">
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { formatNumber } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean = false;
  export let absentValue: string = PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let hasError: boolean;
  $: hasError = $icpSwapUsdPricesStore === "error";

  let hasPrices: boolean;
  $: hasPrices = !hasError && nonNullish($icpSwapUsdPricesStore);

  let hasPricesAndUnpricedTokens: boolean;
  $: hasPricesAndUnpricedTokens = hasPrices && hasUnpricedTokens;

  let usdAmountFormatted: string;
  $: usdAmountFormatted =
    nonNullish(usdAmount) && hasPrices ? formatNumber(usdAmount) : absentValue;

  let icpPrice: number | undefined;
  $: icpPrice =
    isNullish($icpSwapUsdPricesStore) || $icpSwapUsdPricesStore === "error"
      ? undefined
      : $icpSwapUsdPricesStore[LEDGER_CANISTER_ID.toText()];

  let icpAmount: number | undefined;
  $: icpAmount = icpPrice && usdAmount && usdAmount / icpPrice;

  let icpAmountFormatted: string;
  $: icpAmountFormatted = nonNullish(icpAmount)
    ? formatNumber(icpAmount)
    : absentValue;
</script>

<slot
  {icpPrice}
  {usdAmountFormatted}
  {icpAmountFormatted}
  {hasPricesAndUnpricedTokens}
  {hasError}
/>
