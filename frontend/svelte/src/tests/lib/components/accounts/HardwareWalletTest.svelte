<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    TransactionContext,
    transactionStore,
  } from "../../../../lib/stores/transaction.store";
  import { ADD_ACCOUNT_CONTEXT_KEY } from "../../../../lib/stores/add-account.store";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: () => void | undefined = undefined;

  setContext<TransactionContext>(ADD_ACCOUNT_CONTEXT_KEY, {
    store: transactionStore,
    next: () => nextCallback?.(),
  });
</script>

<svelte:component this={testComponent} />
