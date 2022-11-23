<script lang="ts">
  import { projectsStore } from "$lib/stores/projects.store";
  import type { Account } from "$lib/types/account";
  import { mapSnsTransaction } from "$lib/utils/sns-transactions.utils";
  import type { Transaction } from "$lib/utils/transactions.utils";
  import type { Principal } from "@dfinity/principal";
  import type { SnsTransactionWithId } from "@dfinity/sns";
  import TransactionCard from "./TransactionCard.svelte";

  export let transactionWithId: SnsTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;
  export let rootCanisterId: Principal;

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId = $projectsStore?.find(
    ({ rootCanisterId: currentId }) =>
      currentId.toText() === rootCanisterId.toText()
  )?.summary.governanceCanisterId;

  let transactionData: Transaction | undefined;
  $: transactionData = mapSnsTransaction({
    transaction: transactionWithId,
    account,
    toSelfTransaction,
    governanceCanisterId,
  });
</script>

{#if transactionData !== undefined}
  <TransactionCard
    {toSelfTransaction}
    transaction={transactionData}
    token={account.balance.token}
  />
{/if}
