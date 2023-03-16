<script lang="ts">
  import { SvelteComponent } from "svelte";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";

  export let testComponent: typeof SvelteComponent;
</script>

<svelte:component this={testComponent} />

<CkBTCAccountsModals />
