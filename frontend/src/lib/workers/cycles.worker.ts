import { queryCanisterDetails } from "$lib/api/canisters.api.cjs";
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { SYNC_CYCLES_TIMER_INTERVAL } from "$lib/constants/canisters.constants";
import type { CanisterSync } from "$lib/types/canister";
import type { PostMessageDataRequestCycles } from "$lib/types/post-message.canister";
import type { PostMessage } from "$lib/types/post-messages";
import { loadIdentity } from "$lib/utils/worker.utils";
import type { Identity } from "@dfinity/agent";

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestCycles>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopCyclesTimer":
      await stopCyclesTimer();
      return;
    case "nnsStartCyclesTimer":
      await startCyclesTimer({ data });
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const startCyclesTimer = async ({
  data: { canisterId },
}: {
  data: PostMessageDataRequestCycles;
}) => {
  // This worker has already been started
  if (timer !== undefined) {
    return;
  }

  const identity: Identity | undefined = await loadIdentity();

  if (!identity) {
    // We do nothing if no identity
    return;
  }

  const sync = async () => await syncCanister({ identity, canisterId });

  // We sync the cycles now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_CYCLES_TIMER_INTERVAL);
};

const stopCyclesTimer = async () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

let syncInProgress = false;

const syncCanister = async ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: string;
}) => {
  // Avoid to duplicate the sync if already in progress and not yet finished
  if (syncInProgress) {
    return;
  }

  syncInProgress = true;

  try {
    const canisterInfo: CanisterDetails = await queryCanisterDetails({
      canisterId,
      identity,
    });

    syncCanisterData({
      canisterInfo,
      canisterId,
    });
  } catch (err: unknown) {
    console.error(err);

    emitCanister({
      id: canisterId,
      sync: "error",
    });
  }

  syncInProgress = false;
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
