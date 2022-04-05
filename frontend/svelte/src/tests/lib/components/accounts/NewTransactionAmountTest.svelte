<script lang="ts">
  import { setContext } from "svelte";
  import {
    NEW_TRANSACTION_CONTEXT_KEY,
    TransactionContext,
    transactionStore,
  } from "../../../../lib/stores/transaction.store";
  import NewTransactionAmount from "../../../../lib/components/accounts/NewTransactionAmount.svelte";

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: transactionStore,
    next: jest.fn(),
  });
</script>

<NewTransactionAmount />
