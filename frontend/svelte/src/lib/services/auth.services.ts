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

  appendOptionalMsgToUrl(msg);

  window.localStorage.clear();

  // We reload the page to make sure all the states are cleared
  window.location.reload();
};

/**
 * If a message was provided to the logout process - e.g. a message informing the logout happened because the session timedout - append the information to the url as query params
 */
const appendOptionalMsgToUrl = (msg?: Pick<ToastMsg, "labelKey" | "level">) => {
  if (!msg) {
    return;
  }

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
    (urlParams.get(levelParam) as ToastLevel | null) ?? "info";

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
