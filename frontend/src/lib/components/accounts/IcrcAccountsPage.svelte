<script lang="ts">
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { syncAccounts as syncWalletAccounts } from "$lib/services/wallet-accounts.services";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let selectedUniverseId: UniverseCanisterId | undefined;
  export let token: IcrcTokenMetadata | undefined = undefined;

  let loading = false;

  const syncAccounts = async (universeId: UniverseCanisterId | undefined) => {
    if (isNullish(universeId)) {
      return;
    }

    if (hasAccounts($icrcAccountsStore[universeId.toText()]?.accounts ?? [])) {
      // At the moment, we load only once the entire accounts per session.
      // If user performs related actions, accounts are updated.
      return;
    }

    loading = true;
    await syncWalletAccounts({ universeId });
    loading = false;
  };

  $: (async () => syncAccounts(selectedUniverseId))();

  let accounts: Account[] = [];
  $: accounts = nonNullish(selectedUniverseId)
    ? $icrcAccountsStore[selectedUniverseId.toText()]?.accounts ?? []
    : [];
</script>

<div class="card-grid" data-tid="ckbtc-accounts-body">
  {#if loading}
    <SkeletonCard size="medium" />
  {:else if nonNullish(selectedUniverseId)}
    <IcrcBalancesObserver {accounts} universeId={selectedUniverseId}>
      {#each accounts as account}
        <AccountCard {account} {token}
          >{account.name ?? $i18n.accounts.main}</AccountCard
        >
      {/each}

      <slot name="additional-accounts" />
    </IcrcBalancesObserver>
  {/if}
</div>
