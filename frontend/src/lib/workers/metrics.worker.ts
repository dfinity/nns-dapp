import { fetchTransactionRate } from "$lib/api/dashboard.api";
import type { GetTVLResult } from "$lib/canisters/tvl/tvl.canister.types";
import type { FiatCurrency } from "$lib/canisters/tvl/tvl.types";
import {
  SYNC_METRICS_CONFIG,
  SYNC_METRICS_TIMER_INTERVAL,
} from "$lib/constants/metrics.constants";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import type { MetricsSync } from "$lib/types/metrics";
import type { PostMessageDataRequestMetrics } from "$lib/types/post-message.metrics";
import type { PostMessage } from "$lib/types/post-messages";
import { queryTVL } from "$lib/worker-services/$public/tvl.worker-services";
import { nonNullish } from "@dfinity/utils";

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
  ...rest
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
    const randomCurrency = (): FiatCurrency | undefined => {
      const random = Math.floor(1 + Math.random() * 5);

      switch (random) {
        case 2:
          return { CNY: null };
        case 3:
          return { EUR: null };
        case 4:
          return { GBP: null };
        case 5:
          return { JPY: null };
        default:
          return undefined;
      }
    };

    const currency = randomCurrency();

    const metrics = await Promise.all([
      syncTvl
        ? queryTVL({
            ...rest,
            ...(nonNullish(currency) && { currency }),
          })
        : Promise.resolve(undefined),
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
  GetTVLResult | undefined,
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
