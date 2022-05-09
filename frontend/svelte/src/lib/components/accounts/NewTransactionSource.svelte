<script lang="ts">
  import SelectAccount from "./SelectAccount.svelte";
  import type { Account } from "../../types/account";
  import { getContext } from "svelte";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );

  const onSelectAccount = async ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    const { selectSource }: TransactionContext = context;

    await selectSource(detail.selectedAccount);
  };
</script>

<SelectAccount on:nnsSelectAccount={onSelectAccount} />
