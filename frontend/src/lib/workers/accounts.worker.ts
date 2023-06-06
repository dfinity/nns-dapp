import { getIcrcBalance } from "$lib/api/icrc-ledger.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import type { IcrcWorkerData } from "$lib/stores/icrc-worker.store";
import { IcrcWorkerStore } from "$lib/stores/icrc-worker.store";
import type { PostMessageDataRequestAccounts } from "$lib/types/post-message.accounts";
import type { PostMessage } from "$lib/types/post-messages";
import { loadIdentity } from "$lib/utils/worker.utils";
import type { Identity } from "@dfinity/agent";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";

onmessage = async ({
  data: dataMsg,
}: MessageEvent<PostMessage<PostMessageDataRequestAccounts>>) => {
  const { msg, data } = dataMsg;

  switch (msg) {
    case "nnsStopAccountsTimer":
      destroy();
      return;
    case "nnsStartAccountsTimer":
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
  data: PostMessageDataRequestAccounts;
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

  const sync = async () => await syncAccounts({ identity, ...data });

  // We sync the cycles now but also schedule the update afterwards
  await sync();

  timer = setInterval(sync, SYNC_ACCOUNTS_TIMER_INTERVAL);
};

interface AccountBalanceData extends IcrcWorkerData {
  balance: bigint;
}

const store = new IcrcWorkerStore<AccountBalanceData>();

type SyncAccountsParams = {
  identity: Identity;
} & PostMessageDataRequestAccounts;

const syncAccounts = async (params: SyncAccountsParams) => {
  // Avoid to sync if already in progress - do not duplicate calls - or if there was a previous error
  if (syncStatus !== "idle") {
    return;
  }

  syncStatus = "in_progress";

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

    syncStatus = "idle";
  } catch (err: unknown) {
    console.error(err);

    syncStatus = "error";

    // TODO: postMessage error
    // TODO: reset
  }
};

const getIcrcBalances = ({
  identity,
  accounts,
  ledgerCanisterId,
  certified,
}: SyncAccountsParams & { certified: boolean }): Promise<
  AccountBalanceData[]
> =>
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
