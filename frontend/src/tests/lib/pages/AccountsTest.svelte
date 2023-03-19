<script lang="ts">
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import { SvelteComponent } from "svelte";
  import { nonNullish } from "@dfinity/utils";

  export let testComponent: typeof SvelteComponent;
  export let accountIdentifier: string | undefined | null = undefined;
</script>

{#if nonNullish(accountIdentifier)}
  <svelte:component this={testComponent} {accountIdentifier} />
{:else}
  <svelte:component this={testComponent} />
{/if}

<AccountsModals />
