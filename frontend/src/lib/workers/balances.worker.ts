import { getIcrcBalance } from "$lib/api/icrc-ledger.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import type { IcrcWorkerData } from "$lib/stores/icrc-worker.store";
import { IcrcWorkerStore } from "$lib/stores/icrc-worker.store";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalance,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessage } from "$lib/types/post-messages";
import {
  TimerWorkerUtil,
  type TimerWorkerUtilJobData,
} from "$lib/worker-utils/timer.worker-util";
import { decodeIcrcAccount } from "@dfinity/ledger";

// Worker context to start and stop job
const worker = new TimerWorkerUtil();

// A worker store to keep track of account balances
interface BalanceData extends IcrcWorkerData {
  balance: bigint;
}

const store = new IcrcWorkerStore<BalanceData>();

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
        interval: SYNC_ACCOUNTS_TIMER_INTERVAL,
        job: syncBalances,
        data,
      });
      return;
  }
};

const syncBalances = async (
  params: TimerWorkerUtilJobData<PostMessageDataRequestBalances>
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const queries = await getIcrcBalances({
      ...params,
      certified: false,
    });

    const changes = queries.filter(
      ({ accountIdentifier, balance }) =>
        balance !== store.state[accountIdentifier]?.balance
    );

    if (changes.length === 0) {
      // Optimistic approach:
      // Nothing has changed according query calls therefore we stop here for performance reason and, we spare the update calls.
      // We do this for performance reason.
      return;
    }

    console.log("BALANCES", changes);

    // Update store with queries
    store.update(changes);

    // Call and update store with certified data
    const updates = await getIcrcBalances({
      ...params,
      certified: true,
    });

    store.update(updates);

    emitBalances(
      updates.map(({ accountIdentifier, balance }) => ({
        accountIdentifier,
        balance,
      }))
    );
  } catch (err: unknown) {
    // TODO: postMessage error
    // TODO: reset

    // Bubble errors
    throw err;
  }
};

const getIcrcBalances = ({
  identity,
  data: { accountIdentifiers, ledgerCanisterId, ...rest },
  certified,
}: TimerWorkerUtilJobData<PostMessageDataRequestBalances> & {
  certified: boolean;
}): Promise<BalanceData[]> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      const balance = await getIcrcBalance({
        ledgerCanisterId,
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        certified,
        ...rest,
      });

      return {
        balance,
        accountIdentifier,
        certified,
      };
    })
  );

const emitBalances = (balances: PostMessageDataResponseBalance[]) => {
  const data: PostMessageDataResponseBalances = { balances };

  postMessage({
    msg: "nnsSyncBalances",
    data,
  });
};
