export type SnsNeuronModalType =
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey"
  | "stake-maturity";

export interface SnsNeuronModal {
  type: SnsNeuronModalType;
}
