import { ENABLE_SNS } from "$lib/constants/environment.constants";
import {
  loadSnsSummariesProxy,
  loadSnsSwapCommitmentsProxy,
} from "$lib/proxy/$public/sns.services.proxy";
import { loadMainTransactionFee } from "$lib/services/$public/transaction-fees.services";

export const initApp = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [loadMainTransactionFee()];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS
    ? [loadSnsSummariesProxy(), loadSnsSwapCommitmentsProxy()]
    : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
