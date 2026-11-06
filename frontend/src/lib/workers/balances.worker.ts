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
    // Only a certified answer may decide whether a balance changed, because a
    // query answer comes from a single replica.
    const updates = await getIcrcAccountsBalances({
      ...params,
      certified: true,
    });

    const changes = updates.filter(
      ({ key, balance }) => balance !== store.state[key]?.balance
    );

    if (changes.length === 0) {
      return;
    }

    store.update(changes);

    emitBalances(
      changes.map(({ key, balance }) => ({
        accountIdentifier: key,
        balance,
      }))
    );
  } catch (err: unknown) {
    worker.postMsg({
      msg: "nnsSyncErrorBalances",
      data: err,
    });

    // Bubble errors
    throw err;
  }
};

const emitBalances = (balances: PostMessageDataResponseBalance[]) => {
  const data: PostMessageDataResponseBalances = { balances };

  worker.postMsg({
    msg: "nnsSyncBalances",
    data,
  });
};
