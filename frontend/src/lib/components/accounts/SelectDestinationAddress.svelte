<script lang="ts">
  import { accountsListStore } from "$lib/derived/accounts-list.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import {
    getAccountFromStore,
    invalidAddress,
  } from "$lib/utils/accounts.utils";
  import { Toggle } from "@dfinity/gix-components";
  import AddressInput from "./AddressInput.svelte";
  import SelectAccountDropdown from "./SelectAccountDropdown.svelte";

  export let selectedDestinationAddress: string | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
  export let showManualAddress = true;

  // If the component is already initialized with a selectedDestinationAddress
  let selectedAccount: Account | undefined = getAccountFromStore({
    identifier: selectedDestinationAddress,
    accounts: $accountsListStore,
  });
  let address: string;
  $: {
    if (!invalidAddress(address)) {
      selectedDestinationAddress = address;
    }
    // Keep in sync the selected destination address
    if (selectedAccount !== undefined) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }

  // Show the toggle if there are more than one account to select from.
  let showToggle = true;
  $: showToggle = $accountsListStore.filter(filterAccounts).length > 0;

  const onToggleManualInput = () => {
    showManualAddress = !showManualAddress;
    selectedDestinationAddress = undefined;
    selectedAccount = undefined;
  };
</script>

<div data-tid="select-destination">
  <div class="title">
    <p class="label">{$i18n.accounts.destination}</p>
    {#if showToggle}
      <div class="toggle">
        <p>{$i18n.accounts.select}</p>
        <Toggle
          bind:checked={showManualAddress}
          on:nnsToggle={onToggleManualInput}
          ariaLabel="change"
        />
        <p>{$i18n.accounts.manual}</p>
      </div>
    {/if}
  </div>
  {#if showManualAddress}
    <AddressInput bind:address={selectedDestinationAddress} />
  {:else}
    <SelectAccountDropdown {filterAccounts} bind:selectedAccount />
  {/if}
</div>

<style lang="scss">
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .toggle {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
