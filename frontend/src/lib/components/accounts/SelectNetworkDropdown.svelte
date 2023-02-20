<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Dropdown, DropdownItem } from "@dfinity/gix-components";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { notEmptyString } from "@dfinity/utils";

  export let selectedNetwork: TransactionNetwork | undefined = undefined;
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

  .placeholder {
    :global(select) {
      color: var(--disable-contrast);
    }
  }
</style>
