import { browser, prerendering } from "$app/environment";
import { ENABLE_SNS } from "$lib/constants/environment.constants";
import { loadSnsSummaries } from "$lib/services/$public/sns.services";
import { displayAndCleanLogoutMsg } from "$lib/services/auth.services";
import { authStore } from "$lib/stores/auth.store";
import { layoutAuthReady } from "$lib/stores/layout.store";
import { toastsError } from "$lib/stores/toasts.store";

export const initAppPublic = async () => {
  // We first try to sync the IC time to resolve a potential issue (see syncTime documentation).
  // This is performed before initializing private and public data on an app scale because we do not want to call this initialization too much time.
  // Doing so we do it at max twice. e.g. if we call it from the layout we have no control over it and it would be called more times.
  // Commentint until we better understand the implications of this call
  // TODO: https://dfinity.atlassian.net/browse/GIX-1160
  // await syncTime();

  await initAppPublicData();
};

/**
 * Load the application public data that are available globally ("global stores").
 * These data can be read by any users without being signed-in.
 */
const initAppPublicData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [];

  // Sns in an initiative currently under development and not proposed on mainnet yet
  const initSns: Promise<void>[] = ENABLE_SNS ? [loadSnsSummaries()] : [];

  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  return Promise.allSettled([Promise.all(initNns), Promise.all(initSns)]);
};

const syncAuthStore = async () => {
  try {
    await authStore.sync();
  } catch (err) {
    toastsError({ labelKey: "error.auth_sync", err });
  }
};

/**
 * Once per view, we need to initialize the state of the authentication for the app, to get to know if user is signed-in or not.
 *
 * This function does following steps:
 *
 * - init global auth store with the help of agent-js auth-client
 * - display a toast if the user was automatically signed-out by the auth worker crontab
 * - finally set an information for layout purpose about the fact that the auth has been initialized
 */
export const initAppAuth = async () => {
  if (prerendering || !browser) {
    return;
  }

  await syncAuthStore();

  displayAndCleanLogoutMsg();

  layoutAuthReady.set(true);
};
