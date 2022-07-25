<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    NEW_TRANSACTION_CONTEXT_KEY,
    type TransactionContext,
  } from "../../../../lib/types/transaction.context";
  import { mockTransactionStore } from "../../../mocks/transaction.store.mock";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: (() => void) | undefined = undefined;
  export let onTransactionComplete: (() => Promise<void>) | undefined =
    undefined;

  setContext<TransactionContext>(NEW_TRANSACTION_CONTEXT_KEY, {
    store: mockTransactionStore,
    next: () => nextCallback?.(),
    onTransactionComplete,
  });
</script>

<svelte:component this={testComponent} />
