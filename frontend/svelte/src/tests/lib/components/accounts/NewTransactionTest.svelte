<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    NEW_TRANSACTION_CONTEXT_KEY,
    TransactionContext,
  } from "../../../../lib/stores/transaction.store";
  import { mockTransactionStore } from "../../../mocks/transaction.store.mock";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: () => void | undefined = undefined;

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: mockTransactionStore,
    next: () => nextCallback?.(),
  });
</script>

<svelte:component this={testComponent} />
