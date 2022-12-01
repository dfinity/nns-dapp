export type SnsNeuronModalType =
    | "increase-dissolve-delay"
    | "disburse"
    | "dissolve"
    | "follow"
    | "add-hotkey";

export interface SnsNeuronModal {
  type: SnsNeuronModalType;
}
