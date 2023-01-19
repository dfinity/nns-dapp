import type {
  PostMessage,
  PostMessageDataResponse,
} from "$lib/types/post-messages";

export type MetricsCallback = (data: PostMessageDataResponse) => void;

export const initMetricsWorker = async () => {
  const MetricsWorker = await import("$lib/workers/metrics.worker?worker");
  const metricsWorker: Worker = new MetricsWorker.default();

  let metricsCallback: MetricsCallback | undefined;

  metricsWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncMetrics":
        metricsCallback?.(data.data);
        return;
    }
  };

  return {
    startMetricsTimer: ({ callback }: { callback: MetricsCallback }) => {
      metricsCallback = callback;

      metricsWorker.postMessage({
        msg: "nnsStartMetricsTimer",
      });
    },
    stopMetricsTimer: () => {
      metricsWorker.postMessage({
        msg: "nnsStopMetricsTimer",
      });
    },
  };
};
