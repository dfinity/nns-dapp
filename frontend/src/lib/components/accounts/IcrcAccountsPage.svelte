<script lang="ts">
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { syncAccounts as syncWalletAccounts } from "$lib/services/wallet-accounts.services";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { Principal } from "@dfinity/principal";

  export let testId: string;
  export let ledgerCanisterId: Principal | undefined;
  export let token: IcrcTokenMetadata | undefined = undefined;

  let loading = false;

  const syncAccounts = async (ledgerCanisterId: Principal | undefined) => {
    if (isNullish(ledgerCanisterId)) {
      return;
    }

    if (
      hasAccounts($icrcAccountsStore[ledgerCanisterId.toText()]?.accounts ?? [])
    ) {
      // At the moment, we load only once the entire accounts per session.
      // If user performs related actions, accounts are updated.
      return;
    }

    loading = true;
    await syncWalletAccounts({ ledgerCanisterId });
    loading = false;
  };

  $: (async () => syncAccounts(ledgerCanisterId))();

  let accounts: Account[] = [];
  $: accounts = nonNullish(ledgerCanisterId)
    ? $icrcAccountsStore[ledgerCanisterId.toText()]?.accounts ?? []
    : [];
</script>

<div class="card-grid" data-tid={testId}>
  {#if loading}
    <SkeletonCard size="medium" />
  {:else if nonNullish(ledgerCanisterId)}
    <IcrcBalancesObserver {accounts} {ledgerCanisterId}>
      {#each accounts as account}
        <AccountCard {account} {token}
          >{account.name ?? $i18n.accounts.main}</AccountCard
        >
      {/each}

      <slot name="additional-accounts" />
    </IcrcBalancesObserver>
  {/if}
</div>
