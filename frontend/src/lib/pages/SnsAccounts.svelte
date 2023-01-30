<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { pageStore } from "$lib/derived/page.derived";
  import { goToWallet } from "$lib/utils/navigation.accounts.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";

  let loading = false;
  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // TODO: improve loading and use in memory sns neurons or load from backend
        loading = true;
        await syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId });
        loading = false;
      }
    }
  );

  onDestroy(unsubscribe);
</script>

<div class="card-grid" data-tid="sns-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    {#each $snsProjectAccountsStore ?? [] as account}
      <AccountCard
        role="link"
        on:click={() => goToWallet({ account, universe: $pageStore.universe })}
        hash
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</div>
