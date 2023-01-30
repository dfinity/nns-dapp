<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { pageStore } from "$lib/derived/page.derived";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { goToWallet } from "$lib/utils/navigation.accounts.utils";
  import { nonNullish } from "$lib/utils/utils";
</script>

<div class="card-grid" data-tid="accounts-body">
  {#if nonNullish($accountsStore?.main)}
    <!-- Workaround: Type checker does not get $accountsStore.main is defined here -->
    {@const mainAccount = $accountsStore.main}

    <AccountCard
      role="link"
      on:click={() =>
        goToWallet({
          account: mainAccount,
          universe: $pageStore.universe,
        })}
      hash
      account={$accountsStore.main}>{$i18n.accounts.main}</AccountCard
    >
    {#each $accountsStore.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() =>
          goToWallet({ account: subAccount, universe: $pageStore.universe })}
        hash
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each $accountsStore.hardwareWallets ?? [] as walletAccount}
      <AccountCard
        role="link"
        on:click={() =>
          goToWallet({ account: walletAccount, universe: $pageStore.universe })}
        hash
        account={walletAccount}>{walletAccount.name}</AccountCard
      >
    {/each}
  {:else}
    <SkeletonCard size="medium" />
  {/if}
</div>
