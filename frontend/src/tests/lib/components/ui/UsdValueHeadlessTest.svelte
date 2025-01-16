<script lang="ts">
  import UsdValueHeadless from "$lib/components/ui/UsdValueHeadless.svelte";

  export let usdAmount: number | undefined;
  export let hasUnpricedTokens: boolean = false;
</script>

<UsdValueHeadless
  {usdAmount}
  {hasUnpricedTokens}
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
