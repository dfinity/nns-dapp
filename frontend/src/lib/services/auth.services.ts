import { resetAgents } from "$lib/api/agent.api";
import {
  AUTH_SESSION_DURATION,
  IDENTITY_SERVICE_URL,
  OLD_MAINNET_IDENTITY_SERVICE_URL,
} from "$lib/constants/identity.constants";
import { NNS_IC_APP_DERIVATION_ORIGIN } from "$lib/constants/origin.constants";
import { authStore } from "$lib/stores/auth.store";
import { startBusy } from "$lib/stores/busy.store";
import { toastsShow } from "$lib/stores/toasts.store";
import type { ToastMsg } from "$lib/types/toast";
import { createAuthClient } from "$lib/utils/auth.utils";
import { isNnsAlternativeOrigin } from "$lib/utils/env.utils";
import { replaceHistory } from "$lib/utils/route.utils";
import type { Identity } from "@dfinity/agent";
import { AnonymousIdentity } from "@dfinity/agent";
import type { AuthClient } from "@dfinity/auth-client";
import type { ToastLevel } from "@dfinity/gix-components";
import { get } from "svelte/store";

const msgParam = "msg";
const levelParam = "level";

// We have to keep the authClient object in memory because calling the `authClient.login` feature should be triggered by a user interaction without any async callbacks call before calling `window.open` to open II
// @see agent-js issue [#618](https://github.com/dfinity/agent-js/pull/618)
let authClient: AuthClient | undefined | null;

const getIdentityProvider = () => {
  // If we are in mainnet in the old domain, we use the old identity provider.
  if (location.host === "nns.ic0.app") {
    return OLD_MAINNET_IDENTITY_SERVICE_URL;
  }

  return IDENTITY_SERVICE_URL;
};

/**
 * Call auth-client log out and set null in the store. Started with a user interaction ("click on a button")
 *
 * note: clearing idb auth keys does not happen in the state management but afterwards in its caller function (see <Logout/>)
 */
export const logout = async ({
  msg = undefined,
}: {
  msg?: Pick<ToastMsg, "labelKey" | "level">;
}) => {
  // To mask not operational UI (a side effect of sometimes slow JS loading after window.reload because of service worker and no cache).
  startBusy({ initiator: "logout" });

  const client: AuthClient = authClient ?? (await createAuthClient());

  await client.logout();

  resetAgents();

  // We currently do not have issue because the all screen is reloaded after sign-out.
  // But, if we wouldn't, then agent-js auth client would not be able to process next sign-in if object would be still in memory with previous partial information. That's why we reset it.
  // This fix a "sign in -> sign out -> sign in again" flow without window reload.
  authClient = null;

  authStore.setNoIdentity();

  if (msg) {
    appendMsgToUrl(msg);
  }

  // Auth: Delegation and identity are cleared from indexedDB by agent-js so, we do not need to clear these

  // Preferences: We do not clear local storage as well. It contains anonymous information such as the selected theme.
  // Information the user want to preserve across sign-in. e.g. if I select the light theme, logout and sign-in again, I am happy if the dapp still uses the light theme.

  // We reload the page to make sure all the states are cleared
  window.location.reload();
};

/**
 * Log in flow. Started with a user interaction ("click on a button")
 */
export const signIn = async (onError: (error?: string) => void) => {
  authClient = authClient ?? (await createAuthClient());

  await authClient?.login({
    identityProvider: getIdentityProvider(),
    ...(isNnsAlternativeOrigin() && {
      derivationOrigin: NNS_IC_APP_DERIVATION_ORIGIN,
    }),
    maxTimeToLive: AUTH_SESSION_DURATION,
    onSuccess: () => {
      authStore.setIdentity(authClient?.getIdentity());
    },
    onError,
  });
};

/**
 * Sync Auth: query auth-client to get the status of the authentication
 * a. if authenticated only, set identity in the global state
 * b. if not authenticated, set null in store
 *
 * the sync function is performed when the app boots and on any change in the local storage (see <Guard/>)
 *
 * note: auth-client is initialized with an anonymous principal. By querying "isAuthenticated", the library checks for a valid chain and also that the principal is not anonymous.
 */
export const syncAuth = async () => {
  authClient = authClient ?? (await createAuthClient());
  const isAuthenticated = await authClient.isAuthenticated();

  authStore.setIdentity(isAuthenticated ? authClient.getIdentity() : null);
};

/**
 * An anonymous identity that can be use for public call to the IC.
 */
export const getAnonymousIdentity = (): Identity => new AnonymousIdentity();

/**
 * Some services return data regardless if signed-in or not but, returns more information if signed-in.
 * e.g. querying a proposals returns ballots information only if signed-in.
 */
export const getCurrentIdentity = (): Identity =>
  get(authStore).identity ?? new AnonymousIdentity();

/**
 * Provide the identity that has been authorized.
 * If none is provided logout the user automatically. Services that are using this getter need an identity no matter what.
 */
export const getAuthenticatedIdentity = async (): Promise<Identity> => {
  /* eslint-disable-next-line no-async-promise-executor */
  return new Promise<Identity>(async (resolve) => {
    const identity: Identity | undefined | null = get(authStore).identity;

    if (!identity) {
      await logout({
        msg: { labelKey: "error.missing_identity", level: "error" },
      });

      // We do not resolve on purpose. logout() does reload the browser
      return;
    }

    resolve(identity);
  });
};

/**
 * If a message was provided to the logout process - e.g. a message informing the logout happened because the session timed-out - append the information to the url as query params
 */
const appendMsgToUrl = (msg: Pick<ToastMsg, "labelKey" | "level">) => {
  const { labelKey, level } = msg;

  const url: URL = new URL(window.location.href);

  url.searchParams.append(msgParam, encodeURI(labelKey));
  url.searchParams.append(levelParam, level);

  replaceHistory(url);
};

/**
 * If the url contains a msg that has been provided on logout, display it as a toast message. Cleanup url afterwards - we don't want the user to see the message again if reloads the browser
 */
export const displayAndCleanLogoutMsg = () => {
  const urlParams: URLSearchParams = new URLSearchParams(
    window.location.search
  );

  const msg: string | null = urlParams.get(msgParam);

  if (msg === null) {
    return;
  }

  // For simplicity reason we assume the level pass as query params is one of the type ToastLevel
  const level: ToastLevel =
    (urlParams.get(levelParam) as ToastLevel | null) ?? "success";

  toastsShow({ labelKey: msg, level });

  cleanUpMsgUrl();
};

const cleanUpMsgUrl = () => {
  const url: URL = new URL(window.location.href);

  url.searchParams.delete(msgParam);
  url.searchParams.delete(levelParam);

  replaceHistory(url);
};
