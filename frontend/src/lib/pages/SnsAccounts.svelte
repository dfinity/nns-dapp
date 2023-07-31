<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { nonNullish } from "@dfinity/utils";
  import { tokensStore } from "$lib/stores/tokens.store";
  import SnsAccountsBalancesObserver from "$lib/components/accounts/SnsAccountsBalancesObserver.svelte";

  let loading = false;
  const syncSnsAccountsForProject = async (
    selectedProjectCanisterId: Principal | undefined
  ) => {
    if (selectedProjectCanisterId !== undefined) {
      // TODO: improve loading and use in memory sns neurons or load from backend
      loading = true;
      await syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId });
      loading = false;
    }
  };

  $: syncSnsAccountsForProject($snsOnlyProjectStore);

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($snsOnlyProjectStore)
    ? $tokensStore[$snsOnlyProjectStore.toText()]?.token
    : undefined;
</script>

<div class="card-grid" data-tid="sns-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    <SnsAccountsBalancesObserver>
      {#each $snsProjectAccountsStore ?? [] as account}
        <AccountCard
          hash
          {account}
          {token}>{account.name ?? $i18n.accounts.main}</AccountCard
        >
      {/each}
    </SnsAccountsBalancesObserver>
  {/if}
</div>
