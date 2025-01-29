<script lang="ts">
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import IcrcTokenAccountsModals from "$lib/modals/accounts/IcrcTokenAccountsModals.svelte";
  import { nonNullish } from "@dfinity/utils";
  import type { Component } from "svelte";

  export let testComponent: Component;
  export let accountIdentifier: string | undefined | null = undefined;
</script>

{#if nonNullish(accountIdentifier)}
  <svelte:component this={testComponent} {accountIdentifier} />
{:else}
  <svelte:component this={testComponent} />
{/if}

<AccountsModals />
<IcrcTokenAccountsModals />
