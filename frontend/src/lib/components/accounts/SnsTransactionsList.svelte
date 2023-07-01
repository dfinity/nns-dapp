<script lang="ts">
  import { loadSnsAccountNextTransactions } from "$lib/services/sns-transactions.services";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
  import {
    getSortedTransactionsFromStore,
    isIcrcTransactionsCompleted,
  } from "$lib/utils/icrc-transactions.utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import SnsWalletTransactionsObserver from "$lib/components/accounts/SnsWalletTransactionsObserver.svelte";
  import { syncStore } from "$lib/stores/sync.store";

  export let account: Account;
  export let rootCanisterId: Principal;
  export let token: IcrcTokenMetadata | undefined;

  let loading = false;

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
</script>

<SnsWalletTransactionsObserver {account} {completed}>
  <IcrcTransactionsList
    on:nnsIntersect={loadMore}
    {account}
    {transactions}
    loading={loading || $syncStore.transactions === "in_progress"}
    {governanceCanisterId}
    {completed}
    {token}
  />
</SnsWalletTransactionsObserver>
