import { getIcrcBalance } from "$lib/api/icrc-ledger.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import type { IcrcWorkerData } from "$lib/stores/icrc-worker.store";
import { IcrcWorkerStore } from "$lib/stores/icrc-worker.store";
import type { PostMessageDataRequestAccounts } from "$lib/types/post-message.accounts";
import type { PostMessage } from "$lib/types/post-messages";
import {
  WorkerTimer,
  type WorkerTimerJobData,
} from "$lib/workers/worker.timer";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";

// Worker context to start and stop job
const worker = new WorkerTimer();

// A worker store to keep track of account balances
interface AccountBalanceData extends IcrcWorkerData {
  balance: bigint;
}

const store = new IcrcWorkerStore<AccountBalanceData>();

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestAccounts>>) => {
  const { msg, data } = dataMsg;

  const job = async ({
    identity,
    data,
  }: WorkerTimerJobData<PostMessageDataRequestAccounts>) =>
    await syncAccounts({ identity, data });

  switch (msg) {
    case "nnsStopAccountsTimer":
      worker.stop(() => store.reset());
      return;
    case "nnsStartAccountsTimer":
      await worker.start<PostMessageDataRequestAccounts>({
        interval: SYNC_ACCOUNTS_TIMER_INTERVAL,
        job,
        data,
      });
      return;
  }
};

const syncAccounts = async (
  params: WorkerTimerJobData<PostMessageDataRequestAccounts>
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

    store.update(changes);

    // TODO: postMessage

    const updates = await getIcrcBalances({
      ...params,
      certified: true,
    });

    store.update(updates);

    // TODO: postMessage

    console.log(store.state);
  } catch (err: unknown) {
    // TODO: postMessage error
    // TODO: reset

    // Bubble errors
    throw err;
  }
};

const getIcrcBalances = ({
  identity,
  data: { accounts, ledgerCanisterId },
  certified,
}: WorkerTimerJobData<PostMessageDataRequestAccounts> & {
  certified: boolean;
}): Promise<AccountBalanceData[]> =>
  Promise.all(
    accounts.map(async (accountIdentifier) => {
      const balance = await getIcrcBalance({
        canisterId: Principal.fromText(ledgerCanisterId),
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        certified,
      });

      return {
        balance,
        accountIdentifier,
        certified,
      };
    })
  );
