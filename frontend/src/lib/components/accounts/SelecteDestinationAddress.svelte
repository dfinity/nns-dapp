<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import Toggle from "../ui/Toggle.svelte";
  import AddressInput from "./AddressInput.svelte";
  import SelectAccountDropdown from "./SelectAccountDropdown.svelte";

  export let selectedDestinationAddress: string | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;

  let address: string;
  const setDestination = () => {
    selectedDestinationAddress = address;
  };

  let showManualInput: boolean = false;
  const onToggleManualInput = () => {
    showManualInput = !showManualInput;
    selectedDestinationAddress = undefined;
    selectedAccount = undefined;
  };

  let selectedAccount: Account | undefined = undefined;
  $: {
    if (selectedAccount !== undefined) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }
</script>

<div>
  <div class="title">
    <p class="label">{$i18n.accounts.destination}</p>
    <div class="toggle">
      <p>{$i18n.accounts.select}</p>
      <Toggle
        bind:checked={showManualInput}
        on:nnsToggle={onToggleManualInput}
        ariaLabel="change"
      />
      <p>{$i18n.accounts.manual}</p>
    </div>
  </div>
  {#if showManualInput}
    <AddressInput bind:address on:nnsBlur={setDestination} />
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
