import { getIcrcBalance } from "$lib/api/icrc-ledger.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
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
      stopAccountsTimer();
      cleanup();
      return;
    case "nnsStartAccountsTimer":
      await startAccountsTimer({ data });
      return;
  }
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
}

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

interface AccountBalance {
  accountIdentifier: IcrcAccountIdentifierText;
  balance: bigint;
  certified: boolean;
}

type AccountBalanceState = Record<IcrcAccountIdentifierText, AccountBalance>;

class AccountBalanceStore {
  private static readonly EMPTY_STATE: AccountBalanceState = {};
  private _state: AccountBalanceState = AccountBalanceStore.EMPTY_STATE;

  update(accounts: AccountBalance[]) {
    this._state = {
      ...this._state,
      ...accounts.reduce(
          (acc, { accountIdentifier, ...rest }) => ({
            ...acc,
            [accountIdentifier]: {
              accountIdentifier,
              ...rest,
            },
          }),
          {} as AccountBalanceState
      ),
    };
  }

  reset() {
    this._state = AccountBalanceStore.EMPTY_STATE;
  }

  get state(): AccountBalanceState {
    return this._state;
  }
}

const store: AccountBalanceStore = new AccountBalanceStore();

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
}: SyncAccountsParams & { certified: boolean }): Promise<AccountBalance[]> =>
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
