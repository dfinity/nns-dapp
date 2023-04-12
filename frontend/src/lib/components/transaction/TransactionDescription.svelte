<script lang="ts">
import {i18n} from "$lib/stores/i18n";
import {nonNullish} from "@dfinity/utils";
import type {TransactionNetwork} from "$lib/types/transaction";

export let destinationAddress: string;
export let selectedNetwork: TransactionNetwork | undefined = undefined;
</script>

<p class="label">{$i18n.accounts.destination}</p>
<p class="account-identifier value" data-tid="destination">
    <slot name="destination-info" />
    {destinationAddress}
</p>

{#if nonNullish(selectedNetwork)}
    <p class="label">{$i18n.accounts.network}</p>
    <p class="value">
        {$i18n.accounts[selectedNetwork]}
    </p>
{/if}

<p class="label">{$i18n.accounts.description}</p>


<slot name="description" />

<style lang="scss">

  .account-identifier {
    word-break: break-all;
    margin: 0 0 var(--padding);
  }

  p {
    margin: 0;
  }

</style>