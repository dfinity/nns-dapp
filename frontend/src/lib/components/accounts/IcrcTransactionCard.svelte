<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { toUiTransaction } from "$lib/utils/transactions.utils";
  import type { mapIcrcTransactionType } from "$lib/utils/icrc-transactions.utils";
  import type { Principal } from "@dfinity/principal";
  import type { IcrcTransactionWithId } from "@dfinity/ledger-icrc";
  import TransactionCard from "./TransactionCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Transaction } from "$lib/types/transaction";
  import { nonNullish } from "@dfinity/utils";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let transactionWithId: IcrcTransactionWithId;
  export let account: Account;
  export let toSelfTransaction: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;
  export let descriptions: Record<string, string> | undefined = undefined;
  export let token: IcrcTokenMetadata | undefined;
  export let mapTransaction: mapIcrcTransactionType;

  let transactionData: Transaction | undefined;
  $: transactionData = mapTransaction({
    transaction: transactionWithId,
    account,
    toSelfTransaction,
    governanceCanisterId,
  });

  let uiTransaction: UiTransaction;
  $: uiTransaction = toUiTransaction({
    transaction: transactionData,
    toSelfTransaction,
    token,
    transactionNames: $i18n.transaction_names,
    fallbackDescriptions: descriptions,
  });
</script>

{#if nonNullish(transactionData) && nonNullish(token)}
  <TransactionCard transaction={uiTransaction} />
{/if}
