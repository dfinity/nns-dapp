import { IS_TESTNET } from "../constants/environment.constants";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";
import { loadSnsSummaries, loadSnsSwapCommitments } from "./sns.services";
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
  const initSns: Promise<void>[] = IS_TESTNET
    ? [loadSnsSummaries(), loadSnsSwapCommitments()]
    : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
