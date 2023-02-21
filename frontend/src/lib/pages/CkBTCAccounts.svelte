<script lang="ts">
  import { onMount } from "svelte";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { syncCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { hasAccounts } from "$lib/utils/accounts.utils";

  export let goToWallet: (account: Account) => Promise<void>;

  let loading = false;

  onMount(async () => {
    if (hasAccounts($icrcAccountsStore.accounts)) {
      // At the moment, we load only once the entire accounts per session.
      // If user performs related actions, accounts are updated.
      return;
    }

    loading = true;
    await syncCkBTCAccounts({});
    loading = false;
  });
</script>

<div class="card-grid" data-tid="ckbtc-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    {#each $icrcAccountsStore.accounts ?? [] as account}
      <AccountCard
        role="link"
        on:click={() => goToWallet(account)}
        hash
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</div>
