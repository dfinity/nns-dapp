<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { debounce, nonNullish } from "@dfinity/utils";
  import { depositFee as depositFeeService } from "$lib/services/ckbtc-minter.services";
  import type { CanisterId } from "$lib/types/canister";
  import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";

  export let minterCanisterId: CanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  export let kytFee: bigint | undefined | null = undefined;

  const loadKYTFee = async () => {
    if (!isTransactionNetworkBtc(selectedNetwork)) {
      kytFee = null;
      return;
    }

    const callback = (fee: bigint | null) => (kytFee = fee);

    await depositFeeService({
      minterCanisterId,
      callback,
    });
  };

  const debounceEstimateFee = debounce(loadKYTFee);

  $: selectedNetwork, (async () => debounceEstimateFee())();
</script>

{#if nonNullish(kytFee)}
  <p class="fee label no-margin" data-tid="kyt-estimated-fee-label">
    {$i18n.accounts.estimated_internetwork_fee}
  </p>

  <p class="no-margin" data-tid="kyt-estimated-fee">
    <span class="value tabular-num">{formatEstimatedFee(kytFee)}</span>
    <span class="label">{$i18n.ckbtc.btc}</span>
  </p>
{/if}

<style lang="scss">
  .fee {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }
</style>
