import { SYNC_METRICS_TIMER_INTERVAL } from "$lib/constants/metrics.constants";
import { exchangeRateICPToUsd } from "$lib/rest/binance.rest";
import { totalDissolvingNeurons } from "$lib/services/$public/governance-metrics.services";
import type { BinanceAvgPrice } from "$lib/types/binance";
import type { DissolvingNeurons } from "$lib/types/governance-metrics";
import type {
  PostMessage,
  PostMessageDataRequest,
} from "$lib/types/post-messages";

onmessage = async ({
  data,
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
  const { msg } = data;

  switch (msg) {
    case "nnsStopMetricsTimer":
      await stopMetricsTimer();
      return;
    case "nnsStartMetricsTimer":
      await startMetricsTimer();
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startMetricsTimer = async () => {
  const sync = async () => await syncMetrics();

  // We sync now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_METRICS_TIMER_INTERVAL);
};

const stopMetricsTimer = async () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const syncMetrics = async () => {
  const [avgPrice, dissolvingNeurons] = await Promise.all([
    exchangeRateICPToUsd(),
    totalDissolvingNeurons(),
  ]);

  emitCanister({ avgPrice, dissolvingNeurons });
};

const emitCanister = (metrics: {
  avgPrice: BinanceAvgPrice | null;
  dissolvingNeurons: DissolvingNeurons | null;
}) =>
  postMessage({
    msg: "nnsSyncMetrics",
    data: {
      metrics,
    },
  });
