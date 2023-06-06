import type { PostMessageDataResponseCycles } from "$lib/types/post-message.canister";
import type { PostMessage } from "$lib/types/post-messages";

export type CyclesCallback = (data: PostMessageDataResponseCycles) => void;

export interface CyclesWorker {
  startCyclesTimer: (params: {
    canisterId: string;
    callback: CyclesCallback;
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
      canisterId,
    }: {
      canisterId: string;
      callback: CyclesCallback;
    }) => {
      cyclesCallback = callback;

      cyclesWorker.postMessage({
        msg: "nnsStartCyclesTimer",
        data: { canisterId },
      });
    },
    stopCyclesTimer: () => {
      cyclesWorker.postMessage({
        msg: "nnsStopCyclesTimer",
      });
    },
  };
};
