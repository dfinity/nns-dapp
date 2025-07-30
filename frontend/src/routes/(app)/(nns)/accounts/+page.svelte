<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { icpTokensListVisitors } from "$lib/derived/icp-tokens-list-visitors.derived";
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import Accounts from "$lib/routes/Accounts.svelte";
</script>

<TestIdWrapper testId="accounts-plus-page-component">
  {#if $authSignedInStore}
    <Accounts />
  {:else}
    <SignInAccounts userTokensData={$icpTokensListVisitors} />
  {/if}
</TestIdWrapper>
