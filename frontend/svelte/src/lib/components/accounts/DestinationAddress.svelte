<script lang="ts">
  import { emptyAddress } from "../../utils/accounts.utils";
  import type { Account } from "../../types/account";
  import Address from "./Address.svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  export let filterIdentifier: string | undefined = undefined;

  let address: string;
  let mounted: boolean = false;

  onMount(() => (mounted = true));

  const onEnterAddress = () => chooseDestinationAddress(address);

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) =>
    chooseDestinationAddress(detail.selectedAccount.identifier);

  const dispatcher = createEventDispatcher();
  const chooseDestinationAddress = (destinationAddress: string) =>
    dispatcher("nnsAddress", { address: destinationAddress });
</script>

<Address bind:address on:submit={onEnterAddress} />

<!-- Prevent the component to be presented with a scroll offset when navigating between wizard steps -->
<!-- note about disableSelection: if user is entering an address with the input field, the address is not empty and therefore no account shall be selected -->
{#if mounted}
  <SelectAccount
    on:nnsSelectAccount={onSelectAccount}
    disableSelection={!emptyAddress(address)}
    displayTitle={true}
    {filterIdentifier}
  />
{/if}
