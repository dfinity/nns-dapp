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

  onMount(() => {
    pollAccounts();
  });

  onDestroy(() => {
    cancelPollAccounts();
  });
</script>

<div class="card-grid" data-tid="accounts-body">
  {#if nonNullish($icpAccountsStore?.main)}
    <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
    {@const mainAccount = $icpAccountsStore.main}

    <AccountCard hash account={mainAccount} token={ICPToken}
      >{$i18n.accounts.main}</AccountCard
    >
    {#each $icpAccountsStore.subAccounts ?? [] as subAccount}
      <AccountCard hash account={subAccount} token={ICPToken}
        >{subAccount.name}</AccountCard
      >
    {/each}
    {#each $icpAccountsStore.hardwareWallets ?? [] as walletAccount}
      <AccountCard hash account={walletAccount} token={ICPToken}
        >{walletAccount.name}</AccountCard
      >
    {/each}

    <NnsAddAccount />
  {:else}
    <SkeletonCard size="medium" />
  {/if}
</div>
