import type { AuthStoreData } from "$lib/stores/auth.store";
import type {
  PostMessage,
  PostMessageDataResponse,
} from "$lib/types/post-messages";
import { logout } from "./auth.services";
import {authRemainingTimeStore} from "$lib/stores/auth.store";

export const initAuthWorker = async () => {
  const AuthWorker = await import("$lib/workers/auth.worker?worker");
  const authWorker: Worker = new AuthWorker.default();

  authWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
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
        authRemainingTimeStore.set(value?.authRemainingTime);
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
