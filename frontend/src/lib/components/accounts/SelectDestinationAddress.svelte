<script lang="ts">
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import {
    getAccountFromStore,
    invalidAddress,
  } from "../../utils/accounts.utils";
  import Toggle from "../ui/Toggle.svelte";
  import AddressInput from "./AddressInput.svelte";
  import SelectAccountDropdown from "./SelectAccountDropdown.svelte";

  export let selectedDestinationAddress: string | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
  export let showManualAddress: boolean = true;

  let address: string;
  $: {
    if (!invalidAddress(address)) {
      selectedDestinationAddress = address;
    }
  }

  const onToggleManualInput = () => {
    showManualAddress = !showManualAddress;
    selectedDestinationAddress = undefined;
    selectedAccount = undefined;
  };

  // If the component is already initialized with a selectedDestinationAddress
  let selectedAccount: Account | undefined = getAccountFromStore({
    identifier: selectedDestinationAddress,
    accountsStore: $accountsStore,
  });
  // Keep in sync the selected destination addres
  $: {
    if (selectedAccount !== undefined) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }
</script>

<div data-tid="select-destination">
  <div class="title">
    <p class="label">{$i18n.accounts.destination}</p>
    <div class="toggle">
      <p>{$i18n.accounts.select}</p>
      <Toggle
        bind:checked={showManualAddress}
        on:nnsToggle={onToggleManualInput}
        ariaLabel="change"
      />
      <p>{$i18n.accounts.manual}</p>
    </div>
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

  .label {
    color: var(--label-color);
  }
</style>
