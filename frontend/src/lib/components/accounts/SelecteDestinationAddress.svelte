<script lang="ts">
  import type { Account } from "../../types/account";
  import Toggle from "../ui/Toggle.svelte";

  import Address from "./Address.svelte";
  import SelectAccountDropdown from "./SelectAccountDropdown.svelte";

  export let selectedDestinationAddress: string | undefined = undefined;

  let address: string;
  const onEnterAddress = () => (selectedDestinationAddress = address);

  let showManualInput: boolean = false;
  const onToggleManualInput = () => (showManualInput = !showManualInput);

  let selectedAccount: Account | undefined = undefined;
  $: {
    if (selectedAccount !== undefined) {
      selectedDestinationAddress = selectedAccount.identifier;
    }
  }
</script>

<div>
  <div>
    <p>Manual Address</p>
    <Toggle
      bind:checked={showManualInput}
      on:nnsToggle={onToggleManualInput}
      ariaLabel="change"
    />
    <p>Select Account</p>
  </div>
  {#if showManualInput}
    <Address
      bind:address={selectedDestinationAddress}
      on:submit={onEnterAddress}
    />
  {:else}
    <SelectAccountDropdown bind:selectedAccount />
  {/if}
</div>
