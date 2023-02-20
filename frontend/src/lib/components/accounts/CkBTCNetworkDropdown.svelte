<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";

  let selectedNetwork: string | undefined = undefined;
</script>

<div>
  <p class="label">{$i18n.accounts.network}</p>

  <Dropdown
    name="network"
    bind:selectedValue={selectedNetwork}
    testId="select-network-dropdown"
  >
    <option disabled selected value class="hidden"></option>
    <DropdownItem value="icp">{$i18n.accounts.network_icp_ckbtc}</DropdownItem>
    <DropdownItem value="bitcoin">{$i18n.accounts.network_bitcoin}</DropdownItem>
  </Dropdown>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }
</style>
