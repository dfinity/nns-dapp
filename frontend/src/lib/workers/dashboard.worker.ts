import { SYNC_DASHBOARD_TIMER_INTERVAL } from "$lib/constants/dashboard.constants";
import { exchangeRateICPToUsd } from "$lib/rest/binance.api";
import type { BinanceAvgPrice } from "$lib/types/binance";
import type {
  PostMessage,
  PostMessageDataRequest,
} from "$lib/types/post-messages";

onmessage = async ({
  data,
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
  const { msg } = data;

  switch (msg) {
    case "nnsStopDashboardTimer":
      await stopDashboardTimer();
      return;
    case "nnsStartDashboardTimer":
      await startDashboardTimer();
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startDashboardTimer = async () => {
  const sync = async () => await syncDashboard();

  // We sync now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_DASHBOARD_TIMER_INTERVAL);
};

const stopDashboardTimer = async () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const syncDashboard = async () => {
  const [avgPrice] = await Promise.all([exchangeRateICPToUsd()]);
  emitCanister({ avgPrice });
};

const emitCanister = ({ avgPrice }: { avgPrice: BinanceAvgPrice | null }) =>
  postMessage({
    msg: "nnsSyncDashboard",
    data: {
      dashboard: {
        avgPrice,
      },
    },
  });
