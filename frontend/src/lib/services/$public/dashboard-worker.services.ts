import type {
  PostMessage,
  PostMessageDataResponse,
} from "$lib/types/post-messages";

export type DashboardCallback = (data: PostMessageDataResponse) => void;

export const initDashboardWorker = async () => {
  const DashboardWorker = await import("$lib/workers/dashboard.worker?worker");
  const dashboardWorker: Worker = new DashboardWorker.default();

  let dashboardCallback: DashboardCallback | undefined;

  dashboardWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncDashboard":
        dashboardCallback?.(data.data);
        return;
    }
  };

  return {
    startDashboardTimer: ({ callback }: { callback: DashboardCallback }) => {
      dashboardCallback = callback;

      dashboardWorker.postMessage({
        msg: "nnsStartDashboardTimer",
      });
    },
    stopDashboardTimer: () => {
      dashboardWorker.postMessage({
        msg: "nnsStopDashboardTimer",
      });
    },
  };
};
