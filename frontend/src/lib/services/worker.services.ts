import type { AuthStore } from "$lib/stores/auth.store";
import type { PostMessageEventData } from "$lib/types/post-messages";
import { logout } from "./auth.services";

export const initWorker = async () => {
  const AuthWorker = await import("$lib/workers/auth.worker?worker");
  const authWorker: Worker = new AuthWorker.default();

  authWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessageEventData>) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSignOut":
        await logout({
          msg: {
            labelKey: "warning.auth_sign_out",
            level: "warn",
          },
        });

        return;
    }
  };

  return {
    syncAuthIdle: (auth: AuthStore) => {
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
