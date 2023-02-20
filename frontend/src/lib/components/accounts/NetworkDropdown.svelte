<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "$lib/types/transaction";

  export let selectedNetwork: TransactionNetwork | undefined = undefined;
</script>

<div>
  <p class="label">{$i18n.accounts.network}</p>

  <Dropdown
    name="network"
    bind:selectedValue={selectedNetwork}
    testId="select-network-dropdown"
  >
    <option disabled selected value={undefined} class="hidden" />
    <DropdownItem value={TransactionNetwork.ICP_CKBTC}
      >{$i18n.accounts[TransactionNetwork.ICP_CKBTC]}</DropdownItem
    >
    <DropdownItem value={TransactionNetwork.BITCOIN}
      >{$i18n.accounts[TransactionNetwork.BITCOIN]}</DropdownItem
    >
  </Dropdown>
</div>

<style lang="scss">
  .hidden {
    display: none;
  }
</style>
