import { initAccounts } from "./accounts.services";

export const initAppPrivateData = (): Promise<
  [PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [initAccounts()];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns)]);
};
