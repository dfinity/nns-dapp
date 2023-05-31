<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapIcrcTransaction } from "$lib/utils/icrc-transactions.utils";
  import type { Principal } from "@dfinity/principal";
  import type { IcrcTransactionWithId } from "@dfinity/ledger";
  import TransactionCard from "./TransactionCard.svelte";
  import type { Transaction } from "$lib/types/transaction";
  import { nonNullish } from "@dfinity/utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let transactionWithId: IcrcTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;
  export let descriptions: Record<string, string> | undefined = undefined;
  export let token: IcrcTokenMetadata | undefined;

  let transactionData: Transaction | undefined;
  $: transactionData = mapIcrcTransaction({
    transaction: transactionWithId,
    account,
    toSelfTransaction,
    governanceCanisterId,
  });
</script>

{#if nonNullish(transactionData) && nonNullish(token)}
  <TransactionCard
    {toSelfTransaction}
    transaction={transactionData}
    {token}
    {descriptions}
  />
{/if}
