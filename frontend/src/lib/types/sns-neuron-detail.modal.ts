export type SnsNeuronModalType =
  | "increase-stake"
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey"
  | "stake-maturity"
  | "auto-stake-maturity";

export interface SnsNeuronModal {
  type: SnsNeuronModalType;
}
