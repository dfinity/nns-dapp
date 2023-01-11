import type {
  PostMessage,
  PostMessageDataResponse,
} from "$lib/types/post-messages";

export type CyclesCallback = (data: PostMessageDataResponse) => void;

export const initCyclesWorker = async () => {
  const CyclesWorker = await import("$lib/workers/cycles.worker?worker");
  const cyclesWorker: Worker = new CyclesWorker.default();

  let cyclesCallback: CyclesCallback | undefined;

  cyclesWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
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
      canisterIds,
    }: {
      canisterIds: string[];
      callback: CyclesCallback;
    }) => {
      cyclesCallback = callback;

      cyclesWorker.postMessage({
        msg: "nnsStartCyclesTimer",
        data: { canisterIds },
      });
    },
    stopCyclesTimer: () => {
      cyclesWorker.postMessage({
        msg: "nnsStopCyclesTimer",
      });
    },
  };
};
