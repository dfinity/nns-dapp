<script lang="ts">
  import AddressInput from "$lib/components/accounts/AddressInput.svelte";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type {
    TransactionNetwork,
    TransactionSelectDestinationMethods,
  } from "$lib/types/transaction";
  import {
    getAccountByRootCanister,
    getAccountsByRootCanister,
    invalidAddress,
  } from "$lib/utils/accounts.utils";
  import { Toggle } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";

  export let rootCanisterId: Principal;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let selectMethods: TransactionSelectDestinationMethods = "all";
  export let showManualAddress: boolean = selectMethods !== "dropdown";

  // If the component is already initialized with a selectedDestinationAddress
  let selectedAccount: Account | undefined = getAccountByRootCanister({
    identifier: selectedDestinationAddress,
    rootCanisterId,
    universesAccounts: $universesAccountsStore,
  });
  let address: string | undefined = undefined;
  $: {
    if (
      !invalidAddress({ address, rootCanisterId, network: selectedNetwork })
    ) {
      selectedDestinationAddress = address;
    }
    // Keep in sync the selected destination address
    if (nonNullish(selectedAccount) && !showManualAddress) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }

  // Show the toggle if there are more than one account to select from and if all selection methods is available.
  let showToggle = true;
  $: showToggle =
    selectMethods === "all" &&
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
    <AddressInput
      on:nnsOpenQRCodeReader
      bind:address={selectedDestinationAddress}
      {selectedNetwork}
      {rootCanisterId}
    />
  {:else}
    <SelectAccountDropdown
      {rootCanisterId}
      {filterAccounts}
      bind:selectedAccount
    />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .label {
      @include fonts.small();
      color: var(--text-description);
    }

    .toggle {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
