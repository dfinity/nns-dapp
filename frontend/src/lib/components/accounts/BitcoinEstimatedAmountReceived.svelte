<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import {formatToken, numberToE8s} from "$lib/utils/token.utils";

  export let amount: number | undefined = undefined;
  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  let estimatedAmount = BigInt(0);
  $: estimatedAmount =
    nonNullish(bitcoinEstimatedFee) && nonNullish(amount) && amount > bitcoinEstimatedFee
      ? numberToE8s(amount) - bitcoinEstimatedFee
      : BigInt(0);
</script>

<p data-tid="bitcoin-estimated-amount" class="description">
  {$i18n.accounts.estimated_amount_received}:
  <span class="value">{formatToken({ value: estimatedAmount, detailed: true})}</span>
  <span class="label">{$i18n.ckbtc.btc}</span>
</p>

<style lang="scss">
  p {
    text-align: right;
    padding-top: var(--padding-0_5x);
  }
</style>
