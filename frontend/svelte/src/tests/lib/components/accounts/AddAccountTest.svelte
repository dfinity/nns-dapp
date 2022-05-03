<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    AccountType,
    ADD_ACCOUNT_CONTEXT_KEY,
    AddAccountContext,
    addAccountStore,
  } from "../../../../lib/stores/add-account.store";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: () => void | undefined = undefined;

  setContext<AddAccountContext>(ADD_ACCOUNT_CONTEXT_KEY, {
    store: addAccountStore,
    selectType: async (type: AccountType) =>
      addAccountStore.update((data) => ({ ...data, type })),
    next: () => nextCallback?.(),
  });
</script>

<svelte:component this={testComponent} />
