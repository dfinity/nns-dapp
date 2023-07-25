<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import Accounts from "$lib/routes/Accounts.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

{#if $authSignedInStore}
  <Accounts />
{:else}
  <SignInAccounts />
{/if}
