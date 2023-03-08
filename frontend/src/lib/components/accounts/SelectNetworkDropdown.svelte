<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "$lib/types/transaction";
  import {debounce, nonNullish, notEmptyString} from "@dfinity/utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import {invalidICPOrIcrcAddress} from "$lib/utils/accounts.utils";

  export let universeId: UniverseCanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let selectedDestinationAddress: string | undefined = undefined;

  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC(universeId);

  const onDestinationAddressInput = debounce(() => {
    if (nonNullish(selectedNetwork)) {
      // TODO: display invalid network
      return;
    }

    if (!invalidICPOrIcrcAddress(selectedDestinationAddress)) {
      selectedNetwork = ckTESTBTC ? TransactionNetwork.ICP_CKTESTBTC : TransactionNetwork.ICP_CKBTC;
      return;
    }

    // TODO: BTC testnet and mainnet
  });

  $: selectedDestinationAddress, onDestinationAddressInput()
</script>

<div class:placeholder={!notEmptyString(selectedNetwork)}>
  <p class="label">{$i18n.accounts.network}</p>

  <Dropdown
    name="network"
    bind:selectedValue={selectedNetwork}
    testId="select-network-dropdown"
  >
    <option disabled selected value={undefined} class="hidden"
      ><span class="description">{$i18n.accounts.select_network}</span></option
    >
    {#if ckTESTBTC}
      <DropdownItem value={TransactionNetwork.ICP_CKTESTBTC}
        >{$i18n.accounts.network_icp_cktestbtc}</DropdownItem
      >
      <DropdownItem value={TransactionNetwork.BTC_TESTNET}
        >{$i18n.accounts.network_btc_testnet}</DropdownItem
      >
    {:else}
      <DropdownItem value={TransactionNetwork.ICP_CKBTC}
        >{$i18n.accounts.network_icp_ckbtc}</DropdownItem
      >
      <DropdownItem value={TransactionNetwork.BTC_MAINNET}
        >{$i18n.accounts.network_btc_mainnet}</DropdownItem
      >
    {/if}
  </Dropdown>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }

  .placeholder {
    :global(select) {
      color: var(--disable-contrast);
    }
  }
</style>
