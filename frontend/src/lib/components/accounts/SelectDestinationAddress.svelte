<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import {
    getAccountByRootCanister,
    getAccountsByRootCanister,
    invalidICPOrIcrcAddress,
  } from "$lib/utils/accounts.utils";
  import { Toggle } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import AddressInput from "./AddressInput.svelte";
  import SelectAccountDropdown from "./SelectAccountDropdown.svelte";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import {nonNullish} from "@dfinity/utils";

  export let rootCanisterId: Principal;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
  export let showManualAddress = true;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  // If the component is already initialized with a selectedDestinationAddress
  let selectedAccount: Account | undefined = getAccountByRootCanister({
    identifier: selectedDestinationAddress,
    rootCanisterId,
    universesAccounts: $universesAccountsStore,
  });
  let address: string;
  $: {
    if (!invalidICPOrIcrcAddress(address)) {
      selectedDestinationAddress = address;
    }
    // Keep in sync the selected destination address
    if (nonNullish(selectedAccount) && !showManualAddress) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }

  // Show the toggle if there are more than one account to select from.
  let showToggle = true;
  $: showToggle =
    (getAccountsByRootCanister({
      rootCanisterId,
      universesAccounts: $universesAccountsStore,
    })?.filter(filterAccounts).length ?? 0) > 0;

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
    <AddressInput bind:address={selectedDestinationAddress} {selectedNetwork} />
  {:else}
    <SelectAccountDropdown
      {rootCanisterId}
      {filterAccounts}
      bind:selectedAccount
    />
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
