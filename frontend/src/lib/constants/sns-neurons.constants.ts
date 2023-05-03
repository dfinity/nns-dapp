import { SnsNeuronPermissionType } from "@dfinity/sns";

// Limit coming from the limit of subaccounts
export const MAX_NEURONS_SUBACCOUNTS = 2 ** 16;

export const HOTKEY_PERMISSIONS = [
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
];
export const MANAGE_HOTKEY_PERMISSIONS = [
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
  // gives permission for all actions
  SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS,
];

export const UNSPECIFIED_FUNCTION_ID = BigInt(0);

export const SNS_NEURON_ID_DISPLAY_LENGTH = 14;
