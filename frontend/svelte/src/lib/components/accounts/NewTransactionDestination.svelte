<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Address from "./Address.svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import { getContext, onMount } from "svelte";
  import { emptyAddress } from "../../utils/accounts.utils";
  import type { Account } from "../../types/account";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";

  let address: string;
  let mounted: boolean = false;

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );

  onMount(() => (mounted = true));

  // TODO(L2-430): do we need the identifier or another information of the account for the next function of the wizard?
  const chooseAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) =>
    chooseDestinationAddress(detail.selectedAccount.identifier);

  const chooseAddress = () => chooseDestinationAddress(address);

  const chooseDestinationAddress = (destinationAddress: string) => {
    const { store, next }: TransactionContext = context;

    store.update((data) => ({
      ...data,
      destinationAddress,
    }));

    next?.();
  };
</script>

<div>
  <p>{$i18n.accounts.enter_address_or_select}</p>

  <Address bind:address on:submit={chooseAddress} />

  <!-- Prevent the component to be presented with a scroll offset when navigating between wizard steps -->
  {#if mounted}
    <SelectAccount
      on:nnsSelectAccount={chooseAccount}
      displayTitle={true}
      disableSelection={!emptyAddress(address)}
    />
  {/if}
</div>

<style lang="scss">
  p {
    margin-bottom: calc(1.5 * var(--padding));
  }
</style>
