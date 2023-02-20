<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "../../types/transaction";

  export let selectedNetwork: TransactionNetwork | undefined = undefined;
</script>

<div>
  <p class="label">{$i18n.accounts.network}</p>

  <Dropdown
    name="network"
    bind:selectedValue={selectedNetwork}
    testId="select-network-dropdown"
  >
    <option disabled selected value={undefined} class="hidden"></option>
    <DropdownItem value={TransactionNetwork.ICP}>{$i18n.accounts.network_icp_ckbtc}</DropdownItem>
    <DropdownItem value={TransactionNetwork.BITCOIN}>{$i18n.accounts.network_bitcoin}</DropdownItem>
  </Dropdown>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }
</style>
