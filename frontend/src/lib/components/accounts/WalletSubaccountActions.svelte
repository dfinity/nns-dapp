<script lang="ts">
  import type { AccountType } from "$lib/types/account";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "$lib/types/selected-account.context";
  import RenameSubAccountButton from "./RenameSubAccountButton.svelte";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let type: AccountType | undefined;
  $: type = $store.account?.type;
</script>

{#if type === "subAccount"}
  <RenameSubAccountButton />
{/if}
