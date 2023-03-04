<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;
</script>

{#if nonNullish(bitcoinEstimatedFee)}
  <div data-tid="bitcoin-estimated-fee-display">
    <p class="label">{$i18n.accounts.estimated_bitcoin_transaction_fee}</p>
    <p class="value">
      {formatEstimatedFee(bitcoinEstimatedFee)}
      {$i18n.ckbtc.btc}
    </p>
  </div>
{/if}
