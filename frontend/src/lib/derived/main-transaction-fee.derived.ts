import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { derived } from "svelte/store";

export const mainTransactionFeeStoreAsToken = derived(
  transactionsFeesStore,
  ($store) => TokenAmount.fromE8s({ amount: $store.main, token: ICPToken })
);
