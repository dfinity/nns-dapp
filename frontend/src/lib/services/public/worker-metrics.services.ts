import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { TVL_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import type { PostMessageDataResponseMetrics } from "$lib/types/post-message.metrics";
import type { PostMessage } from "$lib/types/post-messages";

export type MetricsCallback = (data: PostMessageDataResponseMetrics) => void;

export interface MetricsWorker {
  startMetricsTimer: (params: { callback: MetricsCallback }) => void;
  stopMetricsTimer: () => void;
}

export const initMetricsWorker = async (): Promise<MetricsWorker> => {
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
        data: { ...ACTOR_PARAMS, tvlCanisterId: TVL_CANISTER_ID?.toText() },
      });
    },
    stopMetricsTimer: () => {
      metricsWorker.postMessage({
        msg: "nnsStopMetricsTimer",
      });
    },
  };
};
