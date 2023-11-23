<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import NnsAddAccount from "$lib/components/accounts/NnsAddAccount.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { nonNullish } from "@dfinity/utils";
  import { onDestroy, onMount } from "svelte";
  import {
    cancelPollAccounts,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { ICPToken } from "@dfinity/utils";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      pollAccounts();
    }
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

  // TODO: Remove default value when we remove the feature flag
  export let userTokensData: UserTokenData[] = [];
</script>

{#if $ENABLE_MY_TOKENS}
  <TestIdWrapper testId="accounts-body">
    <TokensTable
      {userTokensData}
      firstColumnHeader={$i18n.tokens.accounts_header}
    />
  </TestIdWrapper>
{:else}
  <div class="card-grid" data-tid="accounts-body">
    {#if nonNullish($icpAccountsStore?.main)}
      <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
      {@const mainAccount = $icpAccountsStore.main}

      <AccountCard account={mainAccount} token={ICPToken}
        >{$i18n.accounts.main}</AccountCard
      >
      {#each $icpAccountsStore.subAccounts ?? [] as subAccount}
        <AccountCard account={subAccount} token={ICPToken}
          >{subAccount.name}</AccountCard
        >
      {/each}
      {#each $icpAccountsStore.hardwareWallets ?? [] as walletAccount}
        <AccountCard account={walletAccount} token={ICPToken}
          >{walletAccount.name}</AccountCard
        >
      {/each}

      <NnsAddAccount />
    {:else}
      <SkeletonCard size="medium" />
    {/if}
  </div>
{/if}
