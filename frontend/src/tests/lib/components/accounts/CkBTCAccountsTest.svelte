<script lang="ts">
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import { nonNullish } from "@dfinity/utils";
  import type { SvelteComponent } from "svelte";

  export let accountIdentifier: string | undefined | null = undefined;
  export let testComponent: typeof SvelteComponent;
</script>

{#if nonNullish(accountIdentifier)}
  <svelte:component this={testComponent} {accountIdentifier} />
{:else}
  <svelte:component this={testComponent} />
{/if}

<CkBTCAccountsModals />
