import type {
  PostMessageDataRequestAccounts,
  PostMessageDataResponseAccounts,
} from "$lib/types/post-message.accounts";
import type { PostMessage } from "$lib/types/post-messages";

export type AccountsCallback = (data: PostMessageDataResponseAccounts) => void;

export interface InitAccountsWorker {
  startAccountsTimer: (
    params: {
      callback: AccountsCallback;
    } & PostMessageDataRequestAccounts
  ) => void;
  stopAccountsTimer: () => void;
}

export const initAccountsWorker = async (): Promise<InitAccountsWorker> => {
  const AccountsWorker = await import("$lib/workers/accounts.worker?worker");
  const accountsWorker: Worker = new AccountsWorker.default();

  let accountsCallback: AccountsCallback | undefined;

  accountsWorker.onmessage = async ({
    data,
  }: MessageEvent<PostMessage<PostMessageDataResponseAccounts>>) => {
    const { msg } = data;

    // TODO
  };

  return {
    startAccountsTimer: ({
      callback,
      ...rest
    }: {
      callback: AccountsCallback;
    } & PostMessageDataRequestAccounts) => {
      accountsCallback = callback;

      accountsWorker.postMessage({
        msg: "nnsStartAccountsTimer",
        data: { ...rest },
      });
    },
    stopAccountsTimer: () => {
      accountsWorker.postMessage({
        msg: "nnsStopAccountsTimer",
      });
    },
  };
};
