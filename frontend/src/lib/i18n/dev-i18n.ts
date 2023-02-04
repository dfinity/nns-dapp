import { SnsNeuronPermissionType } from "@dfinity/sns";

export const permissionI18nMapper: { [key: string]: string } = {
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE]: "Vote",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL]:
    "Submit Proposal",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE]:
    "Configure Dissolve State",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE]: "Disburse Neuron",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE_MATURITY]:
    "Disburse Maturity",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_PRINCIPALS]:
    "Manage Principals",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION]:
    "Manage Voting Permission",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT]: "Split Neuron",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY]:
    "Stake Maturity",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_UNSPECIFIED]: "Unspecified",
  [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MERGE_MATURITY]:
    "Merge Maturity",
};
