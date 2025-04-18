import { logout } from "$lib/services/auth.services";
import type { AuthStoreData } from "$lib/stores/auth.store";
import { authRemainingTimeStore } from "$lib/stores/auth.store";
import type { PostMessage } from "$lib/types/post-messages";
import type { PostMessageDataResponseAuth } from "$lib/types/post-messsage.auth";

export interface AuthWorker {
  syncAuthIdle: (auth: AuthStoreData) => void;
}

export const initAuthWorker = async (): Promise<AuthWorker> => {
  const AuthWorker = await import("$lib/workers/auth.worker?worker");
  const authWorker: Worker = new AuthWorker.default();

  authWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseAuth>>) => {
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
