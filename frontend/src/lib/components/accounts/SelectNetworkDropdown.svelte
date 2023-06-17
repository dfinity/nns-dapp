<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { debounce, isNullish, nonNullish } from "@dfinity/utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import {
    invalidBtcAddress,
    invalidIcpAddress,
    invalidIcrcAddress,
  } from "$lib/utils/accounts.utils";
  import { BtcNetwork } from "@dfinity/ckbtc";

  export let universeId: UniverseCanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let selectedDestinationAddress: string | undefined = undefined;

  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC(universeId);

  const onDestinationAddressInput = debounce(() => {
    if (nonNullish(selectedNetwork)) {
      // If the network does not match the address an error "Please enter a valid address." is displayed next to the input.
      return;
    }

    if (
      isNullish(selectedDestinationAddress) ||
      selectedDestinationAddress === ""
    ) {
      return;
    }

    const validIcpAddress = !invalidIcpAddress(selectedDestinationAddress);
    const validIcrcAddress = !invalidIcrcAddress(selectedDestinationAddress);
    if (validIcpAddress || validIcrcAddress) {
      selectedNetwork = TransactionNetwork.ICP;
      return;
    }

    const validBtcAddress = !invalidBtcAddress({
      address: selectedDestinationAddress,
      network: ckTESTBTC ? BtcNetwork.Testnet : BtcNetwork.Mainnet,
    });
    if (validBtcAddress) {
      selectedNetwork = ckTESTBTC
        ? TransactionNetwork.BTC_TESTNET
        : TransactionNetwork.BTC_MAINNET;
    }
  });

  $: selectedDestinationAddress, onDestinationAddressInput();
</script>

<Dropdown
  name="network"
  bind:selectedValue={selectedNetwork}
  testId="select-network-dropdown"
>
  <option disabled selected value={undefined} class="hidden"
    ><span class="description">{$i18n.accounts.select_network}</span></option
  >
  <DropdownItem value={TransactionNetwork.ICP}
    >{$i18n.accounts.network_icp}</DropdownItem
  >
  {#if ckTESTBTC}
    <DropdownItem value={TransactionNetwork.BTC_TESTNET}
      >{$i18n.accounts.network_btc_testnet}</DropdownItem
    >
  {:else}
    <DropdownItem value={TransactionNetwork.BTC_MAINNET}
      >{$i18n.accounts.network_btc_mainnet}</DropdownItem
    >
  {/if}
</Dropdown>

<style lang="scss">
  .hidden {
    display: none;
  }
</style>
