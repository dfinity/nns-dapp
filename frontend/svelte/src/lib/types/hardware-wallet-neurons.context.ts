import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import type { Account } from "./account";

export interface HardwareWalletNeuronInfo extends NeuronInfo {
  controlledByNNSDapp: boolean;
}

export interface HardwareWalletNeuronsStore {
  selectedAccount: Account | undefined;
  neurons: HardwareWalletNeuronInfo[];
}

export interface HardwareWalletNeuronsContext {
  store: Writable<HardwareWalletNeuronsStore>;
}

export const HARDWARE_WALLET_NEURONS_CONTEXT_KEY = Symbol("hardware-wallet-neurons");
