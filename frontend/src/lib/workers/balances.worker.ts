import { SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS } from "$lib/constants/accounts.constants";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalance,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessage } from "$lib/types/post-messages";
import type { GetAccountsBalanceData } from "$lib/worker-services/icrc-balances.worker-services";
import { getIcrcAccountsBalances } from "$lib/worker-services/icrc-balances.worker-services";
import { DictionaryWorkerStore } from "$lib/worker-stores/dictionary.worker-store";
import {
  TimerWorkerUtils,
  type TimerWorkerUtilsJobData,
} from "$lib/worker-utils/timer.worker-utils";

// Worker context to start and stop job
const worker = new TimerWorkerUtils();

// A worker store to keep track of account balances
const store = new DictionaryWorkerStore<GetAccountsBalanceData>();

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestBalances>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopBalancesTimer":
      worker.stop();
      store.reset();
      return;
    case "nnsStartBalancesTimer":
      await worker.start<PostMessageDataRequestBalances>({
        interval: SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS,
        job: syncBalances,
        data,
      });
      return;
  }
};

const syncBalances = async (
  params: TimerWorkerUtilsJobData<PostMessageDataRequestBalances>
) => {
  try {
    const queries = await getIcrcAccountsBalances({
      ...params,
      certified: false,
    });

    const changes = queries.filter(
      ({ key, balance }) => balance !== store.state[key]?.balance
    );

    if (changes.length === 0) {
      // Optimistic approach:
      // Nothing has changed according query calls therefore, we spare the update calls.
      // We do this for performance reason in order to reduce to the amount of update calls we perform from this worker.
      return;
    }

    // Call and update store with certified data
    const updates = await getIcrcAccountsBalances({
      ...params,
      certified: true,
    });

    store.update(updates);

    emitBalances(
      updates.map(({ key, balance }) => ({
        accountIdentifier: key,
        balance,
      }))
    );
  } catch (err: unknown) {
    postMessage({
      msg: "nnsSyncErrorBalances",
      data: err,
    });

    // Bubble errors
    throw err;
  }
};

const emitBalances = (balances: PostMessageDataResponseBalance[]) => {
  const data: PostMessageDataResponseBalances = { balances };

  postMessage({
    msg: "nnsSyncBalances",
    data,
  });
};
