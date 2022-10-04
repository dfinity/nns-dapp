import { ICPToken, TokenAmount } from "@dfinity/nns";
import { derived } from "svelte/store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";

export const mainTransactionFeeStoreAsToken = derived(
  transactionsFeesStore,
  ($store) => TokenAmount.fromE8s({ amount: $store.main, token: ICPToken })
);
