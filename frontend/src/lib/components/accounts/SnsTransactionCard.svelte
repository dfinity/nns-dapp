<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapSnsTransaction } from "$lib/utils/sns-transactions.utils";
  import type { Transaction } from "$lib/utils/transactions.utils";
  import type { SnsTransactionWithId } from "@dfinity/sns";
  import TransactionCard from "./TransactionCard.svelte";

  export let transactionWithId: SnsTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;

  let transactionData: Transaction | undefined;
  $: transactionData = mapSnsTransaction({
    transaction: transactionWithId,
    account,
    toSelfTransaction,
  });
</script>

{#if transactionData !== undefined}
  <TransactionCard
    {toSelfTransaction}
    transaction={transactionData}
    token={account.balance.token}
  />
{/if}
