import type { AuthStore } from "../stores/auth.store";
import { authStore } from "../stores/auth.store";
import type { PostMessageEventData } from "../types/post-messages";
import { localStorageAuth } from "../utils/auth.utils";

const initWorker = () => {
  const worker = new Worker("./build/worker.js", { type: "module" });

  worker.onmessage = async ({ data }: MessageEvent<PostMessageEventData>) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSignOut":
        await authStore.signOut();
        return;
    }
  };

  return {
    syncAuthIdle: async (auth: AuthStore) => {
      if (!auth.identity) {
        worker.postMessage({ msg: "nnsStopIdleTimer" });
        return;
      }

      worker.postMessage({
        msg: "nnsStartIdleTimer",
        data: await localStorageAuth(),
      });
    }
  };
};

export const worker = initWorker();
