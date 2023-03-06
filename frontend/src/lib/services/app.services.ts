import { loadSnsProjects } from "./$public/sns.services";
import { initAccounts } from "./accounts.services";

export const initAppPrivateData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [initAccounts()];
  // Reload the SNS projects even if they were loaded.
  // Get latest data and create wrapper caches for the logged in identity.
  const initSns: Promise<void>[] = [loadSnsProjects()];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};
