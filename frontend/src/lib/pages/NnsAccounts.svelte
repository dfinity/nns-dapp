<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { nonNullish } from "$lib/utils/utils";
  import type { Account } from "$lib/types/account";

  export let goToWallet: (account: Account) => Promise<void>;
</script>

<div class="card-grid" data-tid="accounts-body">
  {#if nonNullish($accountsStore?.main)}
    <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
    {@const mainAccount = $accountsStore.main}

    <AccountCard
      role="link"
      on:click={() => goToWallet(mainAccount)}
      hash
      account={$accountsStore.main}>{$i18n.accounts.main}</AccountCard
    >
    {#each $accountsStore.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => goToWallet(subAccount)}
        hash
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each $accountsStore.hardwareWallets ?? [] as walletAccount}
      <AccountCard
        role="link"
        on:click={() => goToWallet(walletAccount)}
        hash
        account={walletAccount}>{walletAccount.name}</AccountCard
      >
    {/each}
  {:else}
    <SkeletonCard size="medium" />
  {/if}
</div>
