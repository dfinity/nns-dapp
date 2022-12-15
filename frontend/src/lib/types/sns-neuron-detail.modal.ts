export type SnsNeuronModalType =
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey"
  | "stake-maturity"
  | "split-neuron"
  | "auto-stake-maturity";

export interface SnsNeuronModal {
  type: SnsNeuronModalType;
}
