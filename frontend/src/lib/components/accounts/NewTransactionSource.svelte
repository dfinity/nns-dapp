<script lang="ts">
  import SelectAccount from "./SelectAccount.svelte";
  import type { Account } from "../../types/account";
  import { getContext } from "svelte";
  import type { TransactionContext } from "../../types/transaction.context";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../types/transaction.context";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    const { store, next }: TransactionContext = context;

    store.update((data) => ({
      ...data,
      selectedAccount: detail.selectedAccount,
    }));

    next?.();
  };
</script>

<SelectAccount on:nnsSelectAccount={onSelectAccount} />
