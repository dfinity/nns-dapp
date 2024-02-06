<script lang="ts">
  import type { BalancesObserverData } from "$lib/types/icrc.observer";
  import { nonNullish } from "@dfinity/utils";
  import BalancesObserver from "$lib/components/accounts/BalancesObserver.svelte";
  import type { BalancesCallback } from "$lib/services/worker-balances.services";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";

  export let ledgerCanisterId: Principal;
  export let accounts: Account[];
  export let reload: (() => void) | undefined = undefined;

  const callback: BalancesCallback = ({ balances }) => {
    const accounts = balances
      .map(({ balance, accountIdentifier }) => {
        const selectedAccount = $icrcAccountsStore[
          ledgerCanisterId.toText()
        ].accounts?.find(({ identifier }) => identifier === accountIdentifier);

        return nonNullish(selectedAccount)
          ? ({
              ...selectedAccount,
              balanceUlps: balance,
            } as Account)
          : undefined;
      })
      .filter(nonNullish);

    icrcAccountsStore.update({
      accounts: {
        accounts,
        certified: $icrcAccountsStore[ledgerCanisterId.toText()].certified,
      },
      ledgerCanisterId,
    });

    reload?.();
  };

  let data: BalancesObserverData;
  $: data = {
    accounts,
    ledgerCanisterId: ledgerCanisterId.toText(),
  };
</script>

{#if nonNullish(data)}
  <BalancesObserver {data} {callback}>
    <slot />
  </BalancesObserver>
{/if}
