import { loadMainTransactionFee } from "$lib/services/transaction-fees.services";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";

export const initAppPrivateData = (): Promise<
  [PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [
    syncAccounts(),
    listNeurons(),
    loadMainTransactionFee(),
  ];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns)]);
};
