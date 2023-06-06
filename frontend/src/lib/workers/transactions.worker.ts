import { SYNC_TRANSACTIONS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import {
  IcrcWorkerStore,
  type IcrcWorkerData,
} from "$lib/stores/icrc-worker.store";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { loadIdentity } from "$lib/utils/worker.utils";
import type { Identity } from "@dfinity/agent";

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestTransactions>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopTransactionsTimer":
      destroy();
      return;
    case "nnsStartTransactionsTimer":
      await startAccountsTimer({ data });
      return;
  }
};

const destroy = () => {
  stopAccountsTimer();
  cleanup();
};

let timer: NodeJS.Timeout | undefined = undefined;
let syncStatus: "idle" | "in_progress" | "error" = "idle";

const stopAccountsTimer = () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const cleanup = () => {
  store.reset();
  syncStatus = "idle";
};

const startAccountsTimer = async ({
  data,
}: {
  data: PostMessageDataRequestTransactions;
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

  const sync = async () => await syncTransactions({ identity, ...data });

  // We sync the cycles now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_TRANSACTIONS_TIMER_INTERVAL);
};

interface TransactionsData extends IcrcWorkerData {
  balance: bigint;
}

const store = new IcrcWorkerStore<TransactionsData>();

type SyncTransactionsParams = {
  identity: Identity;
} & PostMessageDataRequestTransactions;

const syncTransactions = async (params: SyncTransactionsParams) => {};
