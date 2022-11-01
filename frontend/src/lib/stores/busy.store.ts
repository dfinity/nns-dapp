import { i18n } from "$lib/stores/i18n";
import {
  startBusy as startBusyStore,
  stopBusy as stopBusyStore,
} from "@dfinity/gix-components";
import { get } from "svelte/store";

export type BusyStateInitiatorType =
  | "stake-neuron"
  | "update-delay"
  | "attach-canister"
  | "detach-canister"
  | "create-canister"
  | "top-up-canister"
  | "add-controller-canister"
  | "remove-controller-canister"
  | "accounts"
  | "toggle-community-fund"
  | "auto-stake-maturity"
  | "split-neuron"
  | "dissolve-action"
  | "add-followee"
  | "remove-followee"
  | "add-hotkey-neuron"
  | "remove-hotkey-neuron"
  | "merge-neurons"
  | "merge-maturity"
  | "spawn-neuron"
  | "stake-maturity"
  | "claim_seed_neurons"
  | "project-participate"
  | "add-sns-hotkey-neuron"
  | "remove-sns-hotkey-neuron"
  | "disburse-neuron"
  | "top-up-neuron"
  | "disburse-sns-neuron";

export interface BusyState {
  initiator: BusyStateInitiatorType;
  labelKey?: string;
}

export const startBusy = ({ initiator, labelKey }: BusyState) =>
  startBusyStore({
    initiator,
    ...(labelKey !== undefined && { text: get(i18n)[labelKey] }),
  });

export const stopBusy = (initiatorToRemove: BusyStateInitiatorType) =>
  stopBusyStore(initiatorToRemove);
