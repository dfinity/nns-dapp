import { getIcrcBalance } from "$lib/api/icrc-ledger.api.cjs";
import { SYNC_ACCOUNTS_TIMER_INTERVAL } from "$lib/constants/accounts.constants";
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
      await stopAccountsTimer();
      return;
    case "nnsStartAccountsTimer":
      await startAccountsTimer({ data });
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;
let syncStatus: "idle" | "in_progress" | "error" = "idle";

const stopAccountsTimer = async () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
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

const syncAccounts = async ({
  identity,
  accounts,
  ledgerCanisterId,
}: {
  identity: Identity;
} & Pick<PostMessageDataRequestAccounts, "accounts" | "ledgerCanisterId">) => {
  // Avoid to sync if already in progress - do not duplicate calls - or if there was a previous error
  if (syncStatus !== "idle") {
    return;
  }

  syncStatus = "in_progress";

  try {
    const results = await Promise.all(
      accounts.map(async (accountIdentifier) => {
        const balance = await getIcrcBalance({
          canisterId: Principal.fromText(ledgerCanisterId),
          identity,
          account: decodeIcrcAccount(accountIdentifier),
          certified: false,
        });

        return {
          balance,
          accountIdentifier,
        };
      })
    );

    // TODO
    console.log(results);

    syncStatus = "idle";
  } catch (err: unknown) {
    console.error(err);

    syncStatus = "error";

    // TODO: emit error
  }
};
