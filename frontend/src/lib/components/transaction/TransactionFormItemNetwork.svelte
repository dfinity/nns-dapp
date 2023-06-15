<script lang="ts">
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { TransactionNetwork } from "$lib/types/transaction";
  import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
  import { notEmptyString } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";

  export let universeId: UniverseCanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let networkReadonly: boolean | undefined = undefined;
</script>

<div
  class:placeholder={!notEmptyString(selectedNetwork)}
  class:readonly={networkReadonly}
>
  <p class="label">{$i18n.accounts.network}</p>

  {#if networkReadonly}
    <p class="network" data-tid="readonly-network">
      {$i18n.accounts[selectedNetwork ?? TransactionNetwork.ICP]}
    </p>
  {:else}
    <SelectNetworkDropdown
      bind:selectedNetwork
      {universeId}
      {selectedDestinationAddress}
    />
  {/if}
</div>

<style lang="scss">
  .placeholder {
    :global(select) {
      color: var(--disable-contrast);
    }
  }

  .label {
    padding: var(--padding-0_5x) 0;
  }

  p {
    margin: 0;
  }

  .readonly {
    margin: var(--padding) 0 0;
  }
</style>
