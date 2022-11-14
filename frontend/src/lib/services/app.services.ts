import { ENABLE_SNS } from "$lib/constants/environment.constants";
import { syncAccounts } from "./accounts.services";
import { listNeurons } from "./neurons.services";

export const initAppData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [syncAccounts(), listNeurons()];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS ? [] : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
