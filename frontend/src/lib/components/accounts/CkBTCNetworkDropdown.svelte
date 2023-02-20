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
    <DropdownItem value="icp">Internet Computer (ckBTC)</DropdownItem>
    <DropdownItem value="bitcoin">Bitcoin (BTC)</DropdownItem>
  </Dropdown>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }
</style>
