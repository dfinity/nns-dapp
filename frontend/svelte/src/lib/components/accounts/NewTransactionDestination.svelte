<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { getContext } from "svelte";
  import type { Account } from "../../types/account";
  import type { TransactionContext } from "../../types/transaction.context";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../types/transaction.context";
  import DestinationAddress from "./DestinationAddress.svelte";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let selectedAccount: Account | undefined = $store.selectedAccount;

  const chooseDestinationAddress = ({
    detail,
  }: CustomEvent<{ address: string }>) => {
    const { store, next }: TransactionContext = context;

    store.update((data) => ({
      ...data,
      destinationAddress: detail.address,
    }));

    next?.();
  };
</script>

<div>
  <p>{$i18n.accounts.enter_address_or_select}</p>

  <DestinationAddress
    on:nnsAddress={chooseDestinationAddress}
    filterIdentifier={selectedAccount?.identifier}
  />
</div>

<style lang="scss">
  p {
    margin-bottom: var(--padding-1_5x);
  }
</style>
