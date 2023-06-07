<script lang="ts">
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";
  import IcrcTransactionsObserver from "$lib/components/accounts/IcrcTransactionsObserver.svelte";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type {TransactionsCallback} from "$lib/services/worker-transactions.services";
  import {jsonReviver} from "$lib/utils/json.utils";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  let data: TransactionsObserverData | undefined;
  $: data =
    nonNullish($store.account) && nonNullish($snsProjectSelectedStore)
      ? {
          account: $store.account,
          indexCanisterId:
            $snsProjectSelectedStore.summary.indexCanisterId.toText(),
        }
      : undefined;

  const callback: TransactionsCallback = ({ transactions }) => {
    if (isNullish(universeId)) {
      // Cannot be undefined
      return;
    }

    for (const account of transactions) {
      const {transactions: ts, ...rest} = account;

      icrcTransactionsStore.addTransactions({
        ...rest,
        transactions: JSON.parse(ts, jsonReviver),
        canisterId: universeId,
      });
    }
  };

  let universeId: UniverseCanisterId | undefined;
  $: universeId = $snsOnlyProjectStore;
</script>

{#if nonNullish(data) && nonNullish(universeId)}
  <IcrcTransactionsObserver {data} {callback}>
    <slot />
  </IcrcTransactionsObserver>
{/if}
