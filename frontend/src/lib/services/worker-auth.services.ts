import type { AuthStoreData } from "$lib/stores/auth.store";
import { authRemainingTimeStore } from "$lib/stores/auth.store";
import type { PostMessage } from "$lib/types/post-messages";
import type { PostMessageDataResponseMetrics } from "$lib/types/post-messsage.auth";
import { logout } from "./auth.services";

export const initAuthWorker = async () => {
  const AuthWorker = await import("$lib/workers/auth.worker?worker");
  const authWorker: Worker = new AuthWorker.default();

  authWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseMetrics>>) => {
    const { msg, data: value } = data;

    switch (msg) {
      case "nnsSignOut":
        await logout({
          msg: {
            labelKey: "warning.auth_sign_out",
            level: "warn",
          },
        });
        return;
      case "nnsDelegationRemainingTime":
        authRemainingTimeStore.set(value.authRemainingTime);
        return;
    }
  };

  return {
    syncAuthIdle: (auth: AuthStoreData) => {
      if (!auth.identity) {
        authWorker.postMessage({ msg: "nnsStopIdleTimer" });
        return;
      }

      authWorker.postMessage({
        msg: "nnsStartIdleTimer",
      });
    },
  };
};
