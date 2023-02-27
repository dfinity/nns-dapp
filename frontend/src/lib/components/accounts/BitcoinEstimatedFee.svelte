<script lang="ts">
  import { TransactionNetwork } from "$lib/types/transaction";
  import { estimateFee as estimateFeeService } from "$lib/services/ckbtc-minter.services";
  import { debounce, nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { numberToE8s } from "$lib/utils/token.utils";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";

  export let amount: number | undefined;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  const estimateFee = async () => {
    if (selectedNetwork !== TransactionNetwork.BITCOIN) {
      bitcoinEstimatedFee = null;
      return;
    }

    const callback = (fee: bigint | null) => (bitcoinEstimatedFee = fee);

    await estimateFeeService({
      params: {
        amount: nonNullish(amount) ? numberToE8s(amount) : undefined,
        certified: false,
      },
      callback,
    });
  };

  const debounceEstimateFee = debounce(estimateFee);

  $: selectedNetwork, amount, (async () => debounceEstimateFee())();
</script>

{#if nonNullish(bitcoinEstimatedFee)}
  <p class="fee description">
    {$i18n.accounts.estimated_bitcoin_transaction_fee}:
    <span class="value">{formatEstimatedFee(bitcoinEstimatedFee)}</span>
    <span class="label">{$i18n.ckbtc.btc}</span>
  </p>
{/if}

<style lang="scss">
  .fee {
    text-align: right;
    padding-top: var(--padding-0_5x);
  }
</style>
