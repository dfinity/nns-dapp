<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import {
    AccountType,
    ADD_ACCOUNT_CONTEXT_KEY,
    AddAccountContext,
  } from "../../../../lib/types/add-account.context";
  import { addAccountStoreMock } from "../../../mocks/add-account.store.mock";

  export let testComponent: typeof SvelteComponent;
  export let nextCallback: () => void | undefined = undefined;

  setContext<AddAccountContext>(ADD_ACCOUNT_CONTEXT_KEY, {
    store: addAccountStoreMock,
    selectType: async (type: AccountType) =>
      addAccountStoreMock.update((data) => ({ ...data, type })),
    next: () => nextCallback?.(),
  });
</script>

<svelte:component this={testComponent} />
