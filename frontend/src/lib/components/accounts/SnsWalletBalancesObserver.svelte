<script lang="ts">
  import type { BalancesObserverData } from "$lib/types/icrc.observer";
  import { nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { getContext } from "svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import type { BalancesCallback } from "$lib/services/worker-balances.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";

  const { store } = getContext<WalletContext>(WALLET_CONTEXT_KEY);

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

    for (const account of accounts) {
      store.set({
        account,
        neurons: [],
      });
    }
  };

  let data: BalancesObserverData | undefined;
  $: data =
    nonNullish($store.account) && nonNullish($snsProjectSelectedStore)
      ? {
          account: $store.account,
          ledgerCanisterId:
            $snsProjectSelectedStore.summary.ledgerCanisterId.toText(),
        }
      : undefined;
</script>

{#if nonNullish(data)}
  <IcrcBalancesObserver {data} {callback}>
    <slot />
  </IcrcBalancesObserver>
{/if}
