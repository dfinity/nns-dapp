import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { PostMessageDataResponseCycles } from "$lib/types/post-message.canister";
import type { PostMessage } from "$lib/types/post-messages";

export type CyclesCallback = (data: PostMessageDataResponseCycles) => void;

export interface CyclesWorker {
  startCyclesTimer: (params: {
    callback: CyclesCallback;
    canisterId: string;
  }) => void;
  stopCyclesTimer: () => void;
}

export const initCyclesWorker = async (): Promise<CyclesWorker> => {
  const CyclesWorker = await import("$lib/workers/cycles.worker?worker");
  const cyclesWorker: Worker = new CyclesWorker.default();

  let cyclesCallback: CyclesCallback | undefined;

  cyclesWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseCycles>>) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncCanister":
        cyclesCallback?.(data.data);
        return;
    }
  };

  return {
    startCyclesTimer: ({
      callback,
      ...rest
    }: {
      callback: CyclesCallback;
      canisterId: string;
    }) => {
      cyclesCallback = callback;

      cyclesWorker.postMessage({
        msg: "nnsStartCyclesTimer",
        data: { ...rest, host: HOST, fetchRootKey: FETCH_ROOT_KEY },
      });
    },
    stopCyclesTimer: () => {
      cyclesWorker.postMessage({
        msg: "nnsStopCyclesTimer",
      });
    },
  };
};
