import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { syncStore } from "$lib/stores/sync.store";
import type {
  PostMessageDataRequestIcpWallet,
  PostMessageDataResponseWallet,
} from "$lib/types/post-message.icp-transactions";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";

export type WalletCallback = (data: PostMessageDataResponseWallet) => void;

export interface WalletWorker {
  startWalletTimer: (
    params: {
      callback: WalletCallback;
    } & Omit<PostMessageDataRequestIcpWallet, "fetchRootKey" | "host">
  ) => void;
  stopWalletTimer: () => void;
}

export const initIcpWalletWorker = async (): Promise<WalletWorker> => {
  const WalletWorker = await import("$lib/workers/icp-wallet.worker?worker");
  const walletWorker: Worker = new WalletWorker.default();

  let walletCallback: WalletCallback | undefined;

  walletWorker.onmessage = async ({
    data,
  }: MessageEvent<
    PostMessage<PostMessageDataResponseWallet | PostMessageDataResponseSync>
  >) => {
    const { msg } = data;

    switch (msg) {
      case "nnsSyncIcpWallet":
        walletCallback?.(data.data as PostMessageDataResponseWallet);
        return;
      case "nnsSyncStatus":
        syncStore.setState({
          key: "wallet",
          state: (data.data as PostMessageDataResponseSync).state,
        });
        return;
      case "nnsSyncErrorTransactions":
        syncStore.setState({
          key: "wallet",
          state: "error",
        });
        return;
    }
  };

  return {
    startWalletTimer: ({
      callback,
      ...rest
    }: {
      callback: WalletCallback;
    } & Omit<PostMessageDataRequestIcpWallet, "fetchRootKey" | "host">) => {
      walletCallback = callback;

      walletWorker.postMessage({
        msg: "nnsStartIcpWalletTimer",
        data: { ...rest, ...ACTOR_PARAMS },
      });
    },
    stopWalletTimer: () => {
      walletWorker.postMessage({
        msg: "nnsStoptIcpWalletTimer",
      });
    },
  };
};
