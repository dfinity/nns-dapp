<script lang="ts">
  import type { BalancesObserverData } from "$lib/types/icrc.observer";
  import { nonNullish } from "@dfinity/utils";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import type { BalancesCallback } from "$lib/services/worker-balances.services";
  import type { Account } from "$lib/types/account";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";

  export let universeId: UniverseCanisterId;
  export let accounts: Account[];
  export let reload: (() => void) | undefined;

  const callback: BalancesCallback = ({ balances }) => {
    const accounts = balances
      .map(({ balance, accountIdentifier }) => {
        const selectedAccount = $icrcAccountsStore[
          universeId.toText()
        ].accounts?.find(({ identifier }) => identifier === accountIdentifier);

        return nonNullish(selectedAccount)
          ? ({
              ...selectedAccount,
              balanceE8s: balance,
            } as Account)
          : undefined;
      })
      .filter(nonNullish);

    icrcAccountsStore.update({
      accounts: {
        accounts,
        certified: $icrcAccountsStore[universeId.toText()].certified,
      },
      universeId,
    });

    reload?.();
  };

  let data: BalancesObserverData;
  $: data = {
    accounts,
    ledgerCanisterId: universeId.toText(),
  };
</script>

{#if nonNullish(data)}
  <IcrcBalancesObserver {data} {callback}>
    <slot />
  </IcrcBalancesObserver>
{/if}
