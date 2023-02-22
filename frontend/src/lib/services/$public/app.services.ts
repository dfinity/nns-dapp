import { browser } from "$app/environment";
import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import {
  loadSnsProjects,
  loadSnsSummaries,
} from "$lib/services/$public/sns.services";
import { displayAndCleanLogoutMsg } from "$lib/services/auth.services";
import { authStore } from "$lib/stores/auth.store";
import { ENABLE_SNS_AGGREGATOR } from "$lib/stores/feature-flags.store";
import { layoutAuthReady } from "$lib/stores/layout.store";
import { toastsError } from "$lib/stores/toasts.store";
import { get } from "svelte/store";

/**
 * Load the application public data that are available globally ("global stores").
 * These data can be read by any users without being signed-in.
 */
export const initAppPublicData = (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const initNns: Promise<void>[] = [];

  const initSns: Promise<void>[] = [
    get(ENABLE_SNS_AGGREGATOR) && SNS_AGGREGATOR_CANISTER_URL !== undefined
      ? loadSnsProjects()
      : loadSnsSummaries(),
  ];

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
  if (!browser) {
    return;
  }

  await syncAuthStore();

  displayAndCleanLogoutMsg();

  layoutAuthReady.set(true);
};
