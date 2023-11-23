<script lang="ts">
  import { loadSnsAccountNextTransactions } from "$lib/services/sns-transactions.services";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";
  import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
    mapIcrcTransaction,
  } from "$lib/utils/icrc-transactions.utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import SnsWalletTransactionsObserver from "$lib/components/accounts/SnsWalletTransactionsObserver.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let account: Account;
  export let rootCanisterId: Principal;
  export let token: IcrcTokenMetadata | undefined;

  let loading = true;

  onMount(async () => {
    loading = true;
    await loadSnsAccountNextTransactions({
      account,
      canisterId: rootCanisterId,
    });
    loading = false;
  });

  // `loadMore` depends on props account and rootCanisterId
  let loadMore: () => Promise<void>;
  $: loadMore = async () => {
    loading = true;
    await loadSnsAccountNextTransactions({
      account,
      canisterId: rootCanisterId,
    });
    loading = false;
  };

  let transactions: IcrcTransactionData[];
  $: transactions = getSortedTransactionsFromStore({
    store: $icrcTransactionsStore,
    canisterId: rootCanisterId,
    account,
  });

  let completed: boolean;
  $: completed = isIcrcTransactionsCompleted({
    store: $icrcTransactionsStore,
    canisterId: rootCanisterId,
    account,
  });

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId = $snsProjectsStore.find(
    ({ rootCanisterId: currentId }) =>
      currentId.toText() === rootCanisterId.toText()
  )?.summary.governanceCanisterId;

  let uiTransactions: UiTransaction[];
  $: uiTransactions = transactions
    .map((transaction: IcrcTransactionData) =>
      mapIcrcTransaction({
        ...transaction,
        account,
        governanceCanisterId,
        token,
        i18n: $i18n,
      })
    )
    .filter(nonNullish);
</script>

<SnsWalletTransactionsObserver {account} {completed}>
  <IcrcTransactionsList
    on:nnsIntersect={loadMore}
    transactions={uiTransactions}
    {loading}
    {completed}
  />
</SnsWalletTransactionsObserver>
