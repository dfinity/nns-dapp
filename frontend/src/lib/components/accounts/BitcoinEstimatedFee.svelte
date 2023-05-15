<script lang="ts">
  import type { TransactionNetwork } from "$lib/types/transaction";
  import { estimateFee as estimateFeeService } from "$lib/services/ckbtc-minter.services";
  import { debounce, nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { numberToE8s } from "$lib/utils/token.utils";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
  import type { CanisterId } from "$lib/types/canister";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
  import type { EstimateWithdrawalFee } from "@dfinity/ckbtc";

  export let minterCanisterId: CanisterId;
  export let amount: number | undefined = undefined;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;

  // TODO: if the fee is ultimately used no where else we can probably move the loading in parent modal component
  const loadEstimatedFee = async () => {
    if (!isTransactionNetworkBtc(selectedNetwork)) {
      bitcoinEstimatedFee = null;
      return;
    }

    const callback = (fee: EstimateWithdrawalFee | null) =>
      (bitcoinEstimatedFee = nonNullish(fee)
        ? fee.bitcoin_fee + fee.minter_fee
        : null);

    await estimateFeeService({
      minterCanisterId,
      params: {
        amount: nonNullish(amount) ? numberToE8s(amount) : undefined,
        certified: false,
      },
      callback,
    });
  };

  const debounceEstimateFee = debounce(loadEstimatedFee);

  $: selectedNetwork, amount, (async () => debounceEstimateFee())();
</script>

{#if nonNullish(bitcoinEstimatedFee)}
  <p class="fee label no-margin" data-tid="bitcoin-estimated-fee-label">
    {$i18n.accounts.estimated_bitcoin_transaction_fee}
  </p>

  <p class="no-margin" data-tid="bitcoin-estimated-fee">
    <span class="value tabular-num"
      >{formatEstimatedFee(bitcoinEstimatedFee)}</span
    >
    <span class="label">{$i18n.ckbtc.btc}</span>
  </p>
{/if}

<style lang="scss">
  .fee {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }
</style>
