import { SYNC_METRICS_TIMER_INTERVAL } from "$lib/constants/metrics.constants";
import type {
  PostMessage,
  PostMessageDataRequest,
} from "$lib/types/post-messages";
import type {TvlResult} from "$lib/canisters/tvl/tvl";
import {queryTVL} from "$lib/services/$public/tvl.service";

onmessage = async ({
  data,
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
  const { msg } = data;

  switch (msg) {
    case "nnsStopMetricsTimer":
      stopMetricsTimer();
      return;
    case "nnsStartMetricsTimer":
      await startMetricsTimer();
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startMetricsTimer = async () => {
  // This worker has already been started
  if (timer !== undefined) {
    return;
  }

  const sync = async () => await syncMetrics();

  // We sync now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_METRICS_TIMER_INTERVAL);
};

const stopMetricsTimer = () => {
  if (timer === undefined) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

let syncInProgress = false;

const syncMetrics = async () => {
  // Avoid to duplicate the sync if already in progress and not yet finished
  if (syncInProgress) {
    return;
  }

  syncInProgress = true;

  const tvl = await queryTVL()

  emitCanister(tvl);

  syncInProgress = false;
};

const emitCanister = (tvl: TvlResult) =>
  postMessage({
    msg: "nnsSyncMetrics",
    data: {
      metrics: {
        tvl
      }
    },
  });
