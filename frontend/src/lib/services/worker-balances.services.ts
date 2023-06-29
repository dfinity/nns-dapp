import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { syncStore } from "$lib/stores/sync.store";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";

export type BalancesCallback = (data: PostMessageDataResponseBalances) => void;

export interface BalancesWorker {
  startBalancesTimer: (
    params: {
      callback: BalancesCallback;
    } & Omit<PostMessageDataRequestBalances, "fetchRootKey" | "host">
  ) => void;
  stopBalancesTimer: () => void;
}

export const initBalancesWorker = async (): Promise<BalancesWorker> => {
  const BalancesWorker = await import("$lib/workers/balances.worker?worker");
  const balancesWorker: Worker = new BalancesWorker.default();

  let balancesCallback: BalancesCallback | undefined;

  balancesWorker.onmessage = async ({
    data,
  }: MessageEvent<
    PostMessage<PostMessageDataResponseBalances | PostMessageDataResponseSync>
  >) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncBalances":
        balancesCallback?.(data.data as PostMessageDataResponseBalances);
        return;
      case "nnsSyncStatus":
        syncStore.setState({
          key: "balances",
          state: (data.data as PostMessageDataResponseSync).state,
        });
        return;
      case "nnsSyncErrorBalances":
        syncStore.setState({
          key: "balances",
          state: "error",
        });
        return;
    }
  };

  return {
    startBalancesTimer: ({
      callback,
      ...rest
    }: {
      callback: BalancesCallback;
    } & Omit<PostMessageDataRequestBalances, "fetchRootKey" | "host">) => {
      balancesCallback = callback;

      balancesWorker.postMessage({
        msg: "nnsStartBalancesTimer",
        data: { ...rest, ...ACTOR_PARAMS },
      });
    },
    stopBalancesTimer: () => {
      balancesWorker.postMessage({
        msg: "nnsStopBalancesTimer",
      });
    },
  };
};
