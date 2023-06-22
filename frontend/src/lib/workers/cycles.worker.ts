import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { SYNC_CYCLES_TIMER_INTERVAL } from "$lib/constants/canisters.constants";
import type { CanisterSync } from "$lib/types/canister";
import type { PostMessageDataRequestCycles } from "$lib/types/post-message.canister";
import type { PostMessage } from "$lib/types/post-messages";
import { queryCanisterDetails } from "$lib/worker-api/canisters.worker-api";
import {
  TimerWorkerUtils,
  type TimerWorkerUtilsJobData,
} from "$lib/worker-utils/timer.worker-utils";

// Worker context to start and stop job
const worker = new TimerWorkerUtils();

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestCycles>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopCyclesTimer":
      worker.stop();
      return;
    case "nnsStartCyclesTimer":
      await worker.start<PostMessageDataRequestCycles>({
        interval: SYNC_CYCLES_TIMER_INTERVAL,
        job: syncCanister,
        data,
      });
      return;
  }
};

const syncCanister = async ({
  identity,
  data,
}: TimerWorkerUtilsJobData<PostMessageDataRequestCycles>) => {
  const { canisterId } = data;
  try {
    const canisterInfo: CanisterDetails = await queryCanisterDetails({
      ...data,
      identity,
    });

    syncCanisterData({
      canisterInfo,
      canisterId,
    });
  } catch (err: unknown) {
    emitCanister({
      id: canisterId,
      sync: "error",
    });

    // Bubble error to stop worker
    throw err;
  }
};

// Update ui with one canister information
const emitCanister = (canister: CanisterSync) =>
  postMessage({
    msg: "nnsSyncCanister",
    data: {
      canister,
    },
  });

const syncCanisterData = ({
  canisterId,
  canisterInfo,
}: {
  canisterId: string;
  canisterInfo: CanisterDetails;
}) => {
  const canister: CanisterSync = {
    id: canisterId,
    sync: "synced",
    cyclesStatus: canisterInfo.cycles > 0 ? "ok" : "empty",
    data: canisterInfo,
  };

  emitCanister(canister);
};
