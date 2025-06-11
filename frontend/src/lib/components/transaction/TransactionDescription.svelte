<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
  import type { Snippet } from "svelte";

  type Props = {
    description: Snippet;
    destinationAddress: string;
    destinationInfo: Snippet;
    selectedNetwork?: TransactionNetwork;
  };

  const {
    description,
    destinationAddress,
    destinationInfo,
    selectedNetwork,
  }: Props = $props();
</script>

<p class="label no-margin">{$i18n.accounts.to_address}</p>
<p class="account-identifier value no-margin" data-tid="destination">
  {@render destinationInfo()}
  {destinationAddress}
</p>

<p class="label desc">{$i18n.accounts.description}</p>
<span data-tid="transaction-description">{@render description()}</span>

<p class="label network">{$i18n.accounts.network}</p>
<p class="value no-margin" data-tid="transaction-description-network">
  {$i18n.accounts[selectedNetwork ?? TransactionNetwork.ICP]}
</p>

<p class="label time">{$i18n.accounts.transaction_time}</p>
<p class="value no-margin" data-tid="transaction-time-description">
  {#if isTransactionNetworkBtc(selectedNetwork)}
    {$i18n.ckbtc.about_thirty_minutes}
  {:else}
    {$i18n.accounts.transaction_time_seconds}
  {/if}
</p>

<style lang="scss">
  .account-identifier {
    word-break: break-all;
    margin: 0 0 var(--padding);
  }

  .time,
  .network,
  .desc {
    margin: var(--padding) 0 0;
  }
</style>
