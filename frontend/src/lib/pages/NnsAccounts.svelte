<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import NnsAddAccount from "$lib/components/accounts/NnsAddAccount.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { nonNullish } from "@dfinity/utils";
  import type { Account } from "$lib/types/account";
  import { onDestroy, onMount } from "svelte";
  import {
    cancelPollAccounts,
    pollAccounts,
  } from "$lib/services/accounts.services";
  import { ICPToken } from "@dfinity/utils";
  import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";

  export let goToWallet: (account: Account) => Promise<void>;

  onMount(() => {
    pollAccounts({ icrcEnabled: $ENABLE_ICP_ICRC });
  });

  onDestroy(() => {
    cancelPollAccounts();
  });
</script>

<div class="card-grid" data-tid="accounts-body">
  {#if nonNullish($accountsStore?.main)}
    <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
    {@const mainAccount = $accountsStore.main}

    <AccountCard
      role="link"
      on:click={() => goToWallet(mainAccount)}
      hash
      account={$accountsStore.main}
      token={ICPToken}>{$i18n.accounts.main}</AccountCard
    >
    {#each $accountsStore.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => goToWallet(subAccount)}
        hash
        account={subAccount}
        token={ICPToken}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each $accountsStore.hardwareWallets ?? [] as walletAccount}
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
