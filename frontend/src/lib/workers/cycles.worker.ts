import { queryCanisterDetails } from "$lib/api/canisters.api.cjs";
import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { SYNC_CYCLES_TIMER_INTERVAL } from "$lib/constants/canisters.constants";
import type { CanisterSync } from "$lib/types/canister";
import type {
  PostMessage,
  PostMessageDataRequest,
} from "$lib/types/post-messages";
import { createAuthClient } from "$lib/utils/auth.utils";
import type { Identity } from "@dfinity/agent";

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "stopCyclesTimer":
      await stopCyclesTimer();
      return;
    case "startCyclesTimer":
      await startCyclesTimer({ data });
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const loadIdentity = async (): Promise<Identity | undefined> => {
  const authClient = await createAuthClient();
  const authenticated = await authClient.isAuthenticated();

  // Not authenticated therefore no identity to fetch the cycles
  if (!authenticated) {
    return undefined;
  }

  return authClient.getIdentity();
};

const startCyclesTimer = async ({
  data: { canisterIds },
}: {
  data: PostMessageDataRequest;
}) => {
  const identity: Identity | undefined = await loadIdentity();

  const sync = async () => await syncCanisters({ identity, canisterIds });

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

const syncCanisters = async ({
  identity,
  canisterIds,
}: {
  identity: Identity | undefined;
  canisterIds: string[];
}) => {
  if (!identity) {
    // We do nothing if no identity
    return;
  }

  await syncNnsCanisters({ identity, canisterIds });
};

const syncNnsCanisters = async ({
  identity,
  canisterIds,
}: {
  identity: Identity;
  canisterIds: string[];
}) => {
  await Promise.allSettled(
    canisterIds.map(async (canisterId: string) => {
      try {
        const canisterInfo: CanisterDetails = await queryCanisterDetails({
          canisterId,
          identity,
        });

        await syncCanister({
          canisterInfo,
          canisterId,
        });
      } catch (err: unknown) {
        console.error(err);

        emitCanister({
          id: canisterId,
          sync: "error",
        });

        throw err;
      }
    })
  );
};

// Update ui with one canister information
const emitCanister = (canister: CanisterSync) =>
  postMessage({
    msg: "syncCanister",
    data: {
      canister,
    },
  });

const syncCanister = async ({
  canisterId,
  canisterInfo,
}: {
  canisterId: string;
  canisterInfo: CanisterDetails;
}) => {
  const canister: CanisterSync = {
    id: canisterId,
    sync: "synced",
    data: canisterInfo,
  };

  emitCanister(canister);
};
