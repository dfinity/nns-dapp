<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SelectProjectDropdownHeader from "$lib/components/ic/SelectProjectDropdownHeader.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
  <main class="legacy">
    {#if ENABLE_SNS_2}
      <SelectProjectDropdownHeader />
    {/if}

    {#if $isNnsProjectStore}
      <NnsAccounts />
    {:else if $snsProjectSelectedStore !== undefined}
      <SnsAccounts />
    {/if}
  </main>

  {#if $isNnsProjectStore}
    <NnsAccountsFooter />
  {:else}
    <SnsAccountsFooter />
  {/if}
{:else}
  <h1>Accounts NOT signed in</h1>

  <SignIn />
{/if}
