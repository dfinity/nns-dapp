import type { FolloweesNeuron } from "$lib/utils/neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";

export type NnsNeuronModalType =
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey"
  | "split-neuron"
  | "increase-stake"
  | "auto-stake-maturity"
  | "stake-maturity"
  | "merge-maturity"
  | "spawn"
  | "join-community-fund"
  | "voting-history";

export interface NnsNeuronModalData {
  neuron: NeuronInfo | undefined | null;
}

export interface NnsNeuronModal<D extends NnsNeuronModalData> {
  type: NnsNeuronModalType;
  data: D;
}

export interface NnsNeuronModalVotingHistoryData extends NnsNeuronModalData {
  followee: FolloweesNeuron | undefined;
}

export type NnsNeuronModalVotingHistory =
  NnsNeuronModal<NnsNeuronModalVotingHistoryData>;
