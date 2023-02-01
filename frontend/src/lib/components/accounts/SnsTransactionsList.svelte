<script lang="ts">
  import { loadSnsAccountNextTransactions } from "$lib/services/sns-transactions.services";
  import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";
  import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
  import type { IcrcTransactionData } from "$lib/types/transaction";
  import { isSnsTransactionsCompleted } from "$lib/utils/sns-transactions.utils";
  import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
  import { getSortedTransactionsFromStore } from "$lib/utils/icrc-transactions.utils";

  export let account: Account;
  export let rootCanisterId: Principal;

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
    rootCanisterId,
    account,
  });

  let completed: boolean;
  $: completed = isSnsTransactionsCompleted({
    store: $icrcTransactionsStore,
    rootCanisterId,
    account,
  });

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId = $snsProjectsStore?.find(
    ({ rootCanisterId: currentId }) =>
      currentId.toText() === rootCanisterId.toText()
  )?.summary.governanceCanisterId;
</script>

<IcrcTransactionsList
  {account}
  {transactions}
  {loading}
  {governanceCanisterId}
  {completed}
/>
