import { ENABLE_SNS } from "$lib/constants/environment.constants";
import { loadSnsSwapCommitmentsProxy } from "$lib/proxy/sns.services.proxy";
import { loadMainTransactionFee } from "$lib/services/transaction-fees.services";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";

export const initAppPrivate = async () => {
  // See initAppPublic for comments
  // Commentint until we better understand the implications of this call
  // TODO: https://dfinity.atlassian.net/browse/GIX-1160
  // await syncTime();

  await initAppPrivateData();
};

const initAppPrivateData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [
    syncAccounts(),
    listNeurons(),
    loadMainTransactionFee(),
  ];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS
    ? [loadSnsSwapCommitmentsProxy()]
    : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
