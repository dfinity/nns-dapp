import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessage } from "$lib/types/post-messages";

export type BalancesCallback = (data: PostMessageDataResponseBalances) => void;

export interface BalancesWorker {
  startBalancesTimer: (
    params: {
      callback: BalancesCallback;
    } & PostMessageDataRequestBalances
  ) => void;
  stopBalancesTimer: () => void;
}

export const initBalancesWorker = async (): Promise<BalancesWorker> => {
  const BalancesWorker = await import("$lib/workers/balances.worker?worker");
  const balancesWorker: Worker = new BalancesWorker.default();

  let balancesCallback: BalancesCallback | undefined;

  balancesWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseBalances>>) => {
    const { msg } = data;

    // TODO
  };

  return {
    startBalancesTimer: ({
      callback,
      ...rest
    }: {
      callback: BalancesCallback;
    } & PostMessageDataRequestBalances) => {
      balancesCallback = callback;

      balancesWorker.postMessage({
        msg: "nnsStartBalancesTimer",
        data: { ...rest },
      });
    },
    stopBalancesTimer: () => {
      balancesWorker.postMessage({
        msg: "nnsStopBalancesTimer",
      });
    },
  };
};
