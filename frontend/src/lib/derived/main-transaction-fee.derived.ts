import { TokenAmount } from "@dfinity/nns";
import { derived } from "svelte/store";
import { transactionsFeesStore } from "../stores/transaction-fees.store";

export const mainTransactionFeeStoreAsToken = derived(
  transactionsFeesStore,
  ($store) => TokenAmount.fromE8s({ amount: $store.main })
);
