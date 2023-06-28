<script lang="ts">
  import type { BalancesObserverData } from "$lib/types/icrc.observer";
  import { nonNullish } from "@dfinity/utils";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import type { BalancesCallback } from "$lib/services/worker-balances.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
  import type { Account } from "$lib/types/account";
  import type { CanisterId } from "$lib/types/canister";

  export let rootCanisterId: CanisterId;
  export let ledgerCanisterId: CanisterId;
  export let account: Account;

  const callback: BalancesCallback = ({ balances }) => {
    const accounts = balances
      .map(({ balance, accountIdentifier }) => {
        const selectedAccount = $snsProjectAccountsStore?.find(
          ({ identifier }) => identifier === accountIdentifier
        );

        return nonNullish(selectedAccount)
          ? {
              ...selectedAccount,
              balanceE8s: balance,
            }
          : undefined;
      })
      .filter(nonNullish);

    snsAccountsStore.updateAccounts({
      accounts,
      rootCanisterId: rootCanisterId,
      certified: true,
    });
  };

  let data: BalancesObserverData;
  $: data = {
    account,
    ledgerCanisterId: ledgerCanisterId.toText(),
  };
</script>

{#if nonNullish(data)}
  <IcrcBalancesObserver {data} {callback}>
    <slot />
  </IcrcBalancesObserver>
{/if}
