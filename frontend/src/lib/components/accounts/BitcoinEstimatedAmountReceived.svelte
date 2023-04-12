<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatToken, numberToE8s } from "$lib/utils/token.utils";

  export let amount: number | undefined = undefined;
  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  let amountE8s = BigInt(0);
  $: amountE8s = nonNullish(amount) ? numberToE8s(amount) : BigInt(0);

  let estimatedAmount = BigInt(0);
  $: estimatedAmount =
    nonNullish(bitcoinEstimatedFee) && amountE8s > bitcoinEstimatedFee
      ? amountE8s - bitcoinEstimatedFee
      : BigInt(0);
</script>

<p data-tid="bitcoin-estimated-amount" class="description">
  {$i18n.accounts.estimated_amount_received}:
  <span class="value" data-tid="bitcoin-estimated-amount-value"
    >{formatToken({ value: estimatedAmount, detailed: true })}</span
  >
  <span class="label">{$i18n.ckbtc.btc}</span>
</p>

<style lang="scss">
  p {
    padding-top: var(--padding-0_5x);
  }
</style>
