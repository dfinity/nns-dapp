import { ENABLE_SNS } from "$lib/constants/environment.constants";
import {
  p_loadSnsSummariesProxy,
  p_loadSnsSwapCommitmentsProxy,
} from "$lib/proxy/sns.services.proxy";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";
import { p_loadMainTransactionFee } from "./transaction-fees.services";

export const initApp = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [
    syncAccounts(),
    listNeurons(),
  ];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS
    ? []
    : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};


export const p_initApp = (): Promise<
    [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
    > => {
  const initNns: Promise<void>[] = [p_loadMainTransactionFee()];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS
      ? [p_loadSnsSummariesProxy(), p_loadSnsSwapCommitmentsProxy()]
      : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};