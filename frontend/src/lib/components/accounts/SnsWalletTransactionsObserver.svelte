<script lang="ts">
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import IcrcTransactionsObserver from "$lib/components/accounts/IcrcTransactionsObserver.svelte";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type {TransactionsCallback} from "$lib/services/worker-transactions.services";
  import {jsonReviver} from "$lib/utils/json.utils";
  import type {Account} from "$lib/types/account";

  export let account: Account;
  export let completed: boolean;

  let data: TransactionsObserverData | undefined;
  $: data =
    nonNullish($snsProjectSelectedStore)
      ? {
          account,
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
      const {transactions: ts, mostRecentTxId: _, accountIdentifier, ...rest} = account;

      icrcTransactionsStore.addTransactions({
        ...rest,
        accountIdentifier,
        transactions: JSON.parse(ts, jsonReviver),
        canisterId: universeId,
        completed
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
