<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    NEW_TRANSACTION_CONTEXT_KEY,
    TransactionContext,
    transactionStore,
  } from "../../../../lib/stores/transaction.store";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: () => void | undefined = undefined;

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: transactionStore,
    next: () => nextCallback?.(),
  });
</script>

<svelte:component this={testComponent} />
