import { SnsNeuronPermissionType } from "@dfinity/sns";

// Limit coming from the limit of subaccounts
export const MAX_NEURONS_SUBACCOUNTS = 2 ** 16;

export const HOTKEY_PERMISSIONS = [
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
];
