import { SYNC_WALLET_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import { DEFAULT_TRANSACTIONS_INDEX_PAGE_LIMIT } from "$lib/constants/constants";
import type { PostMessageDataRequestIcpWallet } from "$lib/types/post-message.icp-transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { loadIdentity } from "$lib/utils/auth.utils";
import { getTransactions } from "$lib/worker-api/icp-index.worker.api";
import type { Identity } from "@dfinity/agent";
import { isNullish, jsonReplacer } from "@dfinity/utils";
import type { Transaction, TransactionWithId } from "@junobuild/ledger";

// TODO: use timer.worker and worker.store

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestIcpWallet>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopIcpWalletTimer":
      stopTimer();
      return;
    case "nnsStartIcpWalletTimer":
      await startTimer({ data });
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

const stopTimer = () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const startTimer = async ({
  data: { accountIdentifier },
}: {
  data: PostMessageDataRequestIcpWallet;
}) => {
  if (isNullish(accountIdentifier)) {
    // No account identifier provided
    return;
  }

  const identity = await loadIdentity();

  if (isNullish(identity)) {
    // We do nothing if no identity
    return;
  }

  // TODO: support multiple account identifier
  const sync = async () => await syncWallet({ accountIdentifier, identity });

  // We sync the cycles now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_WALLET_TIMER_INTERVAL);
};

let syncing = false;

let transactions: Record<string, Transaction> = {};

const syncWallet = async ({
  accountIdentifier,
  identity,
}: {
  accountIdentifier: string;
  identity: Identity;
}) => {
  // We avoid to relaunch a sync while previous sync is not finished
  if (syncing) {
    return;
  }

  syncing = true;

  try {
    const { transactions: fetchedTransactions, ...rest } =
      await getTransactions({
        identity,
        accountIdentifier,
        // We query tip to discover the new transactions
        start: undefined,
        maxResults: DEFAULT_TRANSACTIONS_INDEX_PAGE_LIMIT,
      });

    const newTransactions = fetchedTransactions.filter(
      ({ id }: TransactionWithId) =>
        !Object.keys(transactions).includes(`${id}`)
    );

    if (newTransactions.length === 0) {
      // No new transactions
      syncing = false;
      return;
    }

    transactions = {
      ...transactions,
      ...newTransactions.reduce(
        (
          acc: Record<string, Transaction>,
          { id, transaction }: TransactionWithId
        ) => ({
          ...acc,
          [`${id}`]: transaction,
        }),
        {}
      ),
    };

    postMessage({
      msg: "nnsSyncIcpWallet",
      data: {
        wallet: {
          ...rest,
          newTransactions: JSON.stringify(
            Object.entries(newTransactions).map(
              ([_id, transaction]) => transaction
            ),
            jsonReplacer
          ),
        },
      },
    });
  } catch (err: unknown) {
    console.error(err);
    stopTimer();
  }

  syncing = false;
};
