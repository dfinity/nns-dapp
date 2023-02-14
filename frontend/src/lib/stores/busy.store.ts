import { translate } from "$lib/utils/i18n.utils";
import {
  startBusy as startBusyStore,
  stopBusy as stopBusyStore,
} from "@dfinity/gix-components";

export type BusyStateInitiatorType =
  | "logout"
  | "stake-neuron"
  | "update-delay"
  | "link-canister"
  | "unlink-canister"
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
  | "stake-sns-neuron"
  | "split-sns-neuron"
  | "dissolve-sns-action"
  | "add-sns-followee"
  | "remove-sns-followee"
  | "disburse-sns-neuron"
  | "load-sns-filters"
  | "dev-add-sns-neuron-permissions"
  | "load-sns-accounts"
  | "get-btc-address"
  | "update-ckbtc-balance"
  | "reload-ckbtc-account";

export interface BusyState {
  initiator: BusyStateInitiatorType;
  labelKey?: string;
}

export const startBusy = ({ initiator, labelKey }: BusyState) =>
  startBusyStore({
    initiator,
    ...(labelKey !== undefined && { text: translate({ labelKey }) }),
  });

export const stopBusy = (initiatorToRemove: BusyStateInitiatorType) =>
  stopBusyStore(initiatorToRemove);
