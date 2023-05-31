import type { PostMessage } from "$lib/types/post-messages";
import type {PostMessageDataResponseMetrics} from "$lib/types/post-message.metrics";

export type MetricsCallback = (data: PostMessageDataResponseMetrics) => void;

export const initMetricsWorker = async () => {
  const MetricsWorker = await import("$lib/workers/metrics.worker?worker");
  const metricsWorker: Worker = new MetricsWorker.default();

  let metricsCallback: MetricsCallback | undefined;

  metricsWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseMetrics>>) => {
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
