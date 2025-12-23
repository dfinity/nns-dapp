<script lang="ts">
  import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { TransactionNetwork } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { Html } from "@dfinity/gix-components";
  import { notEmptyString } from "@dfinity/utils";

  export let universeId: UniverseCanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let networkReadonly: boolean | undefined = undefined;
</script>

<div
  class:placeholder={!notEmptyString(selectedNetwork)}
  class:readonly={networkReadonly}
  data-tid="transaction-form-item-network-component"
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
  {#if selectedNetwork === TransactionNetwork.BTC_MAINNET}
    <div class="readonly warning" data-tid="btc-network-warning">
      <Html text={$i18n.accounts.bitcoin_network_warning} />
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .placeholder {
    :global(select) {
      color: var(--disable-contrast);
    }
  }

  .label {
    @include fonts.small();

    padding: var(--padding-0_5x) 0;
    color: var(--text-description);
  }

  p {
    margin: 0;
  }

  .readonly {
    margin: var(--padding) 0 0;
  }

  .warning {
    margin-top: var(--padding-1_5x);
    background-color: var(--warning-emphasis-light);
    color: var(--warning-emphasis-contrast);
    padding: var(--padding) var(--padding-1_5x);
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
  }
</style>
