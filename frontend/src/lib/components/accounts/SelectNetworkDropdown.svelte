<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { notEmptyString } from "@dfinity/utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";

  export let universeId: UniverseCanisterId;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  let networkCkBTCLabel = $i18n.accounts.network_icp_ckbtc;
  $: networkCkBTCLabel = isUniverseCkTESTBTC(universeId)
    ? $i18n.accounts.network_icp_cktestbtc
    : $i18n.accounts.network_icp_ckbtc;

  let networkBitcoinLabel = $i18n.accounts.network_bitcoin;
  $: networkBitcoinLabel = isUniverseCkTESTBTC(universeId)
    ? $i18n.accounts.network_test_bitcoin
    : $i18n.accounts.network_bitcoin;
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
    <DropdownItem value={TransactionNetwork.ICP_CKBTC}
      >{networkCkBTCLabel}</DropdownItem
    >
    <DropdownItem value={TransactionNetwork.BITCOIN}
      >{networkBitcoinLabel}</DropdownItem
    >
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
