import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import type { Account } from "./account";

export interface HardwareWalletNeuronInfo extends NeuronInfo {
  controlledByNNSDapp: boolean;
}

export type WalletModal = "rename" | "hw-list-neurons" | undefined;

/**
 * A store that contains the information for the Wallet context.
 * - selected account and it's transactions
 * - the neurons of the hardware wallet filled once the user approved listing neurons. We notably need a store because the user can add hotkeys to the neurons that are not yet controlled by NNS-dapp and only the UI needs to be updated after such an action has been executed.
 * - a modal the user can open from any child component but has to overflow over the island when the wallet is presented
 */
export interface WalletStore {
  account: Account | undefined;
  neurons: HardwareWalletNeuronInfo[];
  modal: WalletModal;
}

export interface WalletContext {
  store: Writable<WalletStore>;
}

export const WALLET_CONTEXT_KEY = Symbol("wallet");
