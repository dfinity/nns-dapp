<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import { icpTokensListUser } from "$lib/derived/icp-tokens-list-user.derived";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Spinner } from "@dfinity/gix-components";

  $: {
    // For now, the Accounts page is enabled only for NNS
    if (!$isNnsUniverseStore) {
      goto(AppPath.Tokens, { replaceState: true });
    }
  }
</script>

<TestIdWrapper testId="accounts-component">
  <SummaryUniverse />

  {#if $isNnsUniverseStore}
    <NnsAccounts userTokensData={$icpTokensListUser} />
  {:else}
    <!-- This page is only supported for NNS at the moment. The user will be redirected to the tokens page in any other universe. -->
    <Spinner />
  {/if}

  {#if $isNnsUniverseStore}
    <NnsAccountsFooter />
  {/if}

  <AccountsModals />
</TestIdWrapper>
