<script lang="ts">
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { syncCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import CkBTCWithdrawalAccount from "$lib/components/accounts/CkBTCWithdrawalAccount.svelte";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";

  export let goToWallet: (account: Account) => Promise<void>;

  let loading = false;

  const syncAccounts = async (
    selectedCkBTCUniverseId: UniverseCanisterId | undefined
  ) => {
    if (isNullish(selectedCkBTCUniverseId)) {
      return;
    }

    if (
      hasAccounts(
        $icrcAccountsStore[selectedCkBTCUniverseId.toText()]?.accounts ?? []
      )
    ) {
      // At the moment, we load only once the entire accounts per session.
      // If user performs related actions, accounts are updated.
      return;
    }

    loading = true;
    await syncCkBTCAccounts({ universeId: selectedCkBTCUniverseId });
    loading = false;
  };

  $: (async () => syncAccounts($selectedCkBTCUniverseIdStore))();

  let accounts: Account[] = [];
  $: accounts = nonNullish($selectedCkBTCUniverseIdStore)
    ? $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]?.accounts ?? []
    : [];

  // TODO: to be removed when ckBTC with minter is live.
  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC($selectedCkBTCUniverseIdStore);
</script>

<div class="card-grid" data-tid="ckbtc-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else}
    {#each accounts as account}
      <AccountCard
        role="link"
        on:click={() => goToWallet(account)}
        hash
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}

    {#if ckTESTBTC}
      <CkBTCWithdrawalAccount />
    {/if}
  {/if}
</div>
