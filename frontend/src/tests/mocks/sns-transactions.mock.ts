import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import type { Subscriber } from "svelte/store";

export const mockSnsTransactionsStoreSubscribe =
  (store: IcrcTransactionsStoreData) =>
  (run: Subscriber<IcrcTransactionsStoreData>): (() => void) => {
    run(store);

    return () => undefined;
  };
