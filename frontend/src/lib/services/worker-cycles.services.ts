import type { PostMessageDataResponseMetrics } from "$lib/types/post-message.canister";
import type { PostMessage } from "$lib/types/post-messages";

export type CyclesCallback = (data: PostMessageDataResponseMetrics) => void;

export const initCyclesWorker = async () => {
  const CyclesWorker = await import("$lib/workers/cycles.worker?worker");
  const cyclesWorker: Worker = new CyclesWorker.default();

  let cyclesCallback: CyclesCallback | undefined;

  cyclesWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseMetrics>>) => {
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
