<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import { TransactionNetwork } from "$lib/types/transaction";

  export let destinationAddress: string;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
</script>

<p class="label no-margin">{$i18n.accounts.to_address}</p>
<p class="account-identifier value no-margin" data-tid="destination">
  <slot name="destination-info" />
  {destinationAddress}
</p>

<p class="label desc">{$i18n.accounts.description}</p>
<slot name="description" />

<p class="label network">{$i18n.accounts.network}</p>
<p class="value no-margin" data-tid="transaction-description-network">
  {$i18n.accounts[selectedNetwork ?? TransactionNetwork.ICP]}
</p>

<style lang="scss">
  .account-identifier {
    word-break: break-all;
    margin: 0 0 var(--padding);
  }

  .network,
  .desc {
    margin: var(--padding) 0 0;
  }
</style>
