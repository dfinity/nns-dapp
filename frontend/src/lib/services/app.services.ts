import { ENABLE_SNS } from "../constants/environment.constants";
import {
  loadSnsSummariesProxy,
  loadSnsSwapCommitmentsProxy,
} from "../proxy/sns.services.proxy";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";
import { loadMainTransactionFee } from "./transaction-fees.services";

export const initApp = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [
    syncAccounts(),
    listNeurons(),
    loadMainTransactionFee(),
  ];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS
    ? [loadSnsSummariesProxy(), loadSnsSwapCommitmentsProxy()]
    : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
