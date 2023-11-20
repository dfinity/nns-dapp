<script lang="ts">
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import Accounts from "$lib/routes/Accounts.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
</script>

<TestIdWrapper testId="accounts-plus-page-component">
  {#if $authSignedInStore}
    <Accounts />
  {:else}
    <!-- TODO: New derived store accounts visitors https://dfinity.atlassian.net/browse/GIX-2058 -->
    <SignInAccounts />
  {/if}
</TestIdWrapper>
