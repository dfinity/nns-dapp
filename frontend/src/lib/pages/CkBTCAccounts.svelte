<script lang="ts">
  import { onMount } from "svelte";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
  import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { goToWallet } from "$lib/utils/navigation.accounts.utils";

  let loading = false;

  onMount(async () => {
    if ($ckBTCAccountsStore.accounts.length > 0) {
      // At the moment, we load only once the entire accounts per session.
      // If user performs related actions, accounts are updated.
      return;
    }

    loading = true;
    await loadCkBTCAccounts({});
    loading = false;
  });
</script>

<div class="card-grid" data-tid="ckbtc-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    {#each $ckBTCAccountsStore.accounts ?? [] as account}
      <AccountCard
        role="link"
        on:click={() => goToWallet({ account, universe: $pageStore.universe })}
        hash
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</div>
