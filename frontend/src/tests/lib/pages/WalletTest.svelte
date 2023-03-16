<script lang="ts">
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import { SvelteComponent } from "svelte";

  export let testComponent: typeof SvelteComponent;
  export let accountIdentifier: string | undefined | null = undefined;
</script>

<svelte:component this={testComponent} {accountIdentifier} />

<AccountsModals />
