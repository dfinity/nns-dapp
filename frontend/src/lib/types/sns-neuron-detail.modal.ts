export type SnsNeuronModalType =
  | "increase-stake"
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "follow-by-topic"
  | "sns-topic-definitions"
  | "add-hotkey"
  | "stake-maturity"
  | "disburse-maturity"
  | "view-active-disbursements"
  | "split-neuron"
  | "dev-add-permissions"
  | "dev-remove-permissions"
  | "dev-add-maturity"
  | "auto-stake-maturity";

export interface SnsNeuronModal {
  type: SnsNeuronModalType;
}
