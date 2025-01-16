<script lang="ts">
  import UsdValueHeadless from "$lib/components/ui/UsdValueHeadless.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean = false;
  export let absentValue: string = PRICE_NOT_AVAILABLE_PLACEHOLDER;
</script>

<UsdValueHeadless
  {usdAmount}
  {hasUnpricedTokens}
  {absentValue}
  let:usdAmountFormatted
  let:icpAmountFormatted
  let:hasPricesAndUnpricedTokens
  let:hasError
>
  <div data-tid="usd-value-headless-consumer">
    <span data-tid="usd-amount">{usdAmountFormatted}</span>
    <span data-tid="icp-amount">{icpAmountFormatted}</span>
    <span data-tid="has-prices-ans-unpriced-tokens"
      >{hasPricesAndUnpricedTokens.toString()}</span
    >
    <span data-tid="has-error">{hasError.toString()}</span>
  </div></UsdValueHeadless
>
