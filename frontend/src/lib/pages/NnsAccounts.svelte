<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import NnsAddAccount from "$lib/components/accounts/NnsAddAccount.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { nonNullish } from "@dfinity/utils";
  import type { Account } from "$lib/types/account";
  import { onDestroy, onMount } from "svelte";
  import {
    cancelPollAccounts,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { ICPToken } from "@dfinity/utils";

  export let goToWallet: (account: Account) => Promise<void>;

  onMount(() => {
    pollAccounts();
  });

  onDestroy(() => {
    cancelPollAccounts();
  });
</script>

<div>My local dev server</div>

<div class="card-grid" data-tid="accounts-body">
  {#if nonNullish($icpAccountsStore?.main)}
    <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
    {@const mainAccount = $icpAccountsStore.main}

    <AccountCard
      role="link"
      on:click={() => goToWallet(mainAccount)}
      hash
      account={$icpAccountsStore.main}
      token={ICPToken}>{$i18n.accounts.main}</AccountCard
    >
    {#each $icpAccountsStore.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => goToWallet(subAccount)}
        hash
        account={subAccount}
        token={ICPToken}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each $icpAccountsStore.hardwareWallets ?? [] as walletAccount}
      <AccountCard
        role="link"
        on:click={() => goToWallet(walletAccount)}
        hash
        account={walletAccount}
        token={ICPToken}>{walletAccount.name}</AccountCard
      >
    {/each}

    <NnsAddAccount />
  {:else}
    <SkeletonCard size="medium" />
  {/if}
</div>
