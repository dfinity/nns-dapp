import { fetchTransactionRate } from "$lib/api/dashboard.api";
import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import {
  SYNC_METRICS_CONFIG,
  SYNC_METRICS_TIMER_INTERVAL,
} from "$lib/constants/metrics.constants";
import { queryTVL } from "$lib/services/$public/tvl.service";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import type { MetricsSync } from "$lib/types/metrics";
import type { PostMessageDataRequestMetrics } from "$lib/types/post-message.metrics";
import type { PostMessage } from "$lib/types/post-messages";

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestMetrics>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopMetricsTimer":
      stopMetricsTimer();
      return;
    case "nnsStartMetricsTimer":
      await startMetricsTimer(data);
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startMetricsTimer = async (params: PostMessageDataRequestMetrics) => {
  // This worker has already been started
  if (timer !== undefined) {
    return;
  }

  const sync = async () =>
    await syncMetrics({
      syncTvl: SYNC_METRICS_CONFIG.tvl === "sync",
      syncTransactionRate: SYNC_METRICS_CONFIG.transactionRate === "sync",
      ...params,
    });

  // We sync now but also schedule the update afterwards
  await syncMetrics({
    syncTvl: true,
    syncTransactionRate: true,
    ...params,
  });

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

const syncMetrics = async ({
  syncTvl,
  syncTransactionRate,
  host,
  fetchRootKey,
}: {
  syncTvl: boolean;
  syncTransactionRate: boolean;
} & PostMessageDataRequestMetrics) => {
  // Avoid to duplicate the sync if already in progress and not yet finished
  if (syncInProgress) {
    return;
  }

  syncInProgress = true;

  try {
    const metrics = await Promise.all([
      syncTvl ? queryTVL({ host, fetchRootKey }) : Promise.resolve(undefined),
      syncTransactionRate ? fetchTransactionRate() : Promise.resolve(undefined),
    ]);

    emitCanister(metrics);
  } catch (err: unknown) {
    // We silence the error here as it is not an information crucial for the usage of the dapp
    console.error(err);
  }

  syncInProgress = false;
};

const emitCanister = ([tvl, transactionRate]: [
  TvlResult | undefined,
  DashboardMessageExecutionRateResponse | undefined
]) =>
  postMessage({
    msg: "nnsSyncMetrics",
    data: {
      metrics: {
        tvl,
        transactionRate,
      } as MetricsSync,
    },
  });
