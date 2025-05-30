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
  | "rename-canister"
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
  | "add-followee-by-topic"
  | "remove-followee-by-topic"
  | "remove-sns-catch-all-followee"
  | "remove-followee"
  | "add-hotkey-neuron"
  | "remove-hotkey-neuron"
  | "merge-neurons"
  | "merge-maturity"
  | "spawn-neuron"
  | "stake-maturity"
  | "disburse-maturity"
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
  | "remove-sns-legacy-followee"
  | "disburse-sns-neuron"
  | "dev-add-sns-neuron-permissions"
  | "dev-add-sns-neuron-maturity"
  | "dev-add-nns-neuron-maturity"
  | "dev-update-voting-power-refreshed"
  | "update-ckbtc-balance"
  | "reload-receive-account"
  | "import-token-validation"
  | "import-token-importing"
  | "import-token-removing"
  | "import-token-updating"
  | "refresh-voting-power"
  | "change-neuron-visibility"
  | "reporting-neurons"
  | "reporting-transactions";

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
