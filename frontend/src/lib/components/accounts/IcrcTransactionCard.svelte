<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapIcrcTransaction } from "$lib/utils/icrc-transactions.utils";
  import type { Principal } from "@dfinity/principal";
  import type { IcrcTransactionWithId } from "@dfinity/ledger";
  import TransactionCard from "./TransactionCard.svelte";
  import type { Transaction } from "$lib/types/transaction";

  export let transactionWithId: IcrcTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;

  let transactionData: Transaction | undefined;
  $: transactionData = mapIcrcTransaction({
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
