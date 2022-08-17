import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import { authStore } from "../stores/auth.store";
import { toastsStore } from "../stores/toasts.store";
import type { ToastLevel, ToastMsg } from "../types/toast";
import { replaceHistory } from "../utils/route.utils";

const msgParam: string = "msg";
const levelParam: string = "level";

export const logout = async ({
  msg = undefined,
}: {
  msg?: Pick<ToastMsg, "labelKey" | "level">;
}) => {
  await authStore.signOut();

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
 * Provide the identity that has been authorized.
 * If none is provided logout the user automatically. Services that are using this getter need an identity no matter what.
 */
export const getIdentity = async (): Promise<Identity> => {
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
 * If a message was provided to the logout process - e.g. a message informing the logout happened because the session timedout - append the information to the url as query params
 */
const appendMsgToUrl = (msg: Pick<ToastMsg, "labelKey" | "level">) => {
  const { labelKey, level } = msg;

  const urlParams: URLSearchParams = new URLSearchParams(
    window.location.search
  );

  urlParams.append(msgParam, encodeURI(labelKey));
  urlParams.append(levelParam, level);

  updateAuthUrl(urlParams);
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

  toastsStore.show({ labelKey: msg, level });

  cleanUpMsgUrl();
};

const cleanUpMsgUrl = () => {
  const urlParams: URLSearchParams = new URLSearchParams(
    window.location.search
  );

  urlParams.delete(msgParam);
  urlParams.delete(levelParam);

  updateAuthUrl(urlParams);
};

const updateAuthUrl = (urlParams: URLSearchParams) =>
  replaceHistory({
    path: "/",
    query: urlParams.toString(),
  });
