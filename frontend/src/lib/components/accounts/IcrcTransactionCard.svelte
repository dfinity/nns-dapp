<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapSnsTransaction } from "$lib/utils/sns-transactions.utils";
  import type { Transaction } from "$lib/utils/transactions.utils";
  import type { Principal } from "@dfinity/principal";
  import type { IcrcTransactionWithId } from "@dfinity/ledger";
  import TransactionCard from "./TransactionCard.svelte";

  export let transactionWithId: IcrcTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;

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
