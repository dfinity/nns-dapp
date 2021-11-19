// We only want to export the types and not the full service.
// So to update this file, first run 'didc bind -t js payloads.did > payloads.js', then copy the types out from the
// service factory function, and then export them all (use 'export const' rather than just 'const').

import { IDL } from "@dfinity/candid";

export const AddNodeOperatorPayload = IDL.Record({
  node_operator_principal_id: IDL.Opt(IDL.Principal),
  node_allowance: IDL.Nat64,
  node_provider_principal_id: IDL.Opt(IDL.Principal),
});
export const AddNodesToSubnetPayload = IDL.Record({
  subnet_id: IDL.Principal,
  node_ids: IDL.Vec(IDL.Principal),
});
export const Gps = IDL.Record({
  latitude: IDL.Float32,
  longitude: IDL.Float32,
});
export const DataCenterRecord = IDL.Record({
  id: IDL.Text,
  gps: IDL.Opt(Gps),
  region: IDL.Text,
  owner: IDL.Text,
});
export const AddOrRemoveDataCentersProposalPayload = IDL.Record({
  data_centers_to_add: IDL.Vec(DataCenterRecord),
  data_centers_to_remove: IDL.Vec(IDL.Text),
});
export const BlessReplicaVersionPayload = IDL.Record({
  node_manager_sha256_hex: IDL.Text,
  release_package_url: IDL.Text,
  sha256_hex: IDL.Text,
  replica_version_id: IDL.Text,
  release_package_sha256_hex: IDL.Text,
  node_manager_binary_url: IDL.Text,
  binary_url: IDL.Text,
});
export const SubnetFeatures = IDL.Record({ ecdsa_signatures: IDL.Bool });
export const SubnetType = IDL.Variant({
  application: IDL.Null,
  verified_application: IDL.Null,
  system: IDL.Null,
});
export const CreateSubnetPayload = IDL.Record({
  unit_delay_millis: IDL.Nat64,
  max_instructions_per_round: IDL.Nat64,
  features: SubnetFeatures,
  max_instructions_per_message: IDL.Nat64,
  gossip_registry_poll_period_ms: IDL.Nat32,
  max_ingress_bytes_per_message: IDL.Nat64,
  dkg_dealings_per_block: IDL.Nat64,
  max_block_payload_size: IDL.Nat64,
  max_instructions_per_install_code: IDL.Nat64,
  start_as_nns: IDL.Bool,
  is_halted: IDL.Bool,
  gossip_pfn_evaluation_period_ms: IDL.Nat32,
  max_ingress_messages_per_block: IDL.Nat64,
  gossip_max_artifact_streams_per_peer: IDL.Nat32,
  replica_version_id: IDL.Text,
  gossip_max_duplicity: IDL.Nat32,
  gossip_max_chunk_wait_ms: IDL.Nat32,
  dkg_interval_length: IDL.Nat64,
  subnet_id_override: IDL.Opt(IDL.Principal),
  ingress_bytes_per_block_soft_cap: IDL.Nat64,
  initial_notary_delay_millis: IDL.Nat64,
  gossip_max_chunk_size: IDL.Nat32,
  subnet_type: SubnetType,
  gossip_retransmission_request_ms: IDL.Nat32,
  gossip_receive_check_cache_size: IDL.Nat32,
  node_ids: IDL.Vec(IDL.Principal),
});
export const RecoverSubnetPayload = IDL.Record({
  height: IDL.Nat64,
  replacement_nodes: IDL.Opt(IDL.Vec(IDL.Principal)),
  subnet_id: IDL.Principal,
  registry_store_uri: IDL.Opt(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat64)),
  state_hash: IDL.Vec(IDL.Nat8),
  time_ns: IDL.Nat64,
});
export const RemoveNodesFromSubnetPayload = IDL.Record({
  node_ids: IDL.Vec(IDL.Principal),
});
export const SetAuthorizedSubnetworkListArgs = IDL.Record({
  who: IDL.Opt(IDL.Principal),
  subnets: IDL.Vec(IDL.Principal),
});
export const SetFirewallConfigPayload = IDL.Record({
  ipv4_prefixes: IDL.Vec(IDL.Text),
  firewall_config: IDL.Text,
  ipv6_prefixes: IDL.Vec(IDL.Text),
});
export const CanisterAction = IDL.Variant({ Start: IDL.Null, Stop: IDL.Null });
export const StopOrStartNnsCanisterProposalPayload = IDL.Record({
  action: CanisterAction,
  canister_id: IDL.Principal,
});
export const UpdateIcpXdrConversionRatePayload = IDL.Record({
  data_source: IDL.Text,
  xdr_permyriad_per_icp: IDL.Nat64,
  timestamp_seconds: IDL.Nat64,
});
export const UpdateNodeOperatorConfigPayload = IDL.Record({
  node_operator_id: IDL.Opt(IDL.Principal),
  node_allowance: IDL.Opt(IDL.Nat64),
});
export const NodeRewardRate = IDL.Record({
  xdr_permyriad_per_node_per_month: IDL.Nat64,
});
export const NodeRewardRates = IDL.Record({
  rates: IDL.Vec(IDL.Tuple(IDL.Text, NodeRewardRate)),
});
export const UpdateNodeRewardsTableProposalPayload = IDL.Record({
  new_entries: IDL.Vec(IDL.Tuple(IDL.Text, NodeRewardRates)),
});
export const UpdateSubnetPayload = IDL.Record({
  unit_delay_millis: IDL.Opt(IDL.Nat64),
  max_duplicity: IDL.Opt(IDL.Nat32),
  max_instructions_per_round: IDL.Opt(IDL.Nat64),
  features: IDL.Opt(SubnetFeatures),
  set_gossip_config_to_default: IDL.Bool,
  max_instructions_per_message: IDL.Opt(IDL.Nat64),
  pfn_evaluation_period_ms: IDL.Opt(IDL.Nat32),
  subnet_id: IDL.Principal,
  max_ingress_bytes_per_message: IDL.Opt(IDL.Nat64),
  dkg_dealings_per_block: IDL.Opt(IDL.Nat64),
  max_block_payload_size: IDL.Opt(IDL.Nat64),
  max_instructions_per_install_code: IDL.Opt(IDL.Nat64),
  start_as_nns: IDL.Opt(IDL.Bool),
  is_halted: IDL.Opt(IDL.Bool),
  max_number_of_canisters: IDL.Opt(IDL.Nat64),
  advert_best_effort_percentage: IDL.Opt(IDL.Nat32),
  retransmission_request_ms: IDL.Opt(IDL.Nat32),
  dkg_interval_length: IDL.Opt(IDL.Nat64),
  registry_poll_period_ms: IDL.Opt(IDL.Nat32),
  max_chunk_wait_ms: IDL.Opt(IDL.Nat32),
  receive_check_cache_size: IDL.Opt(IDL.Nat32),
  ssh_backup_access: IDL.Opt(IDL.Vec(IDL.Text)),
  ingress_bytes_per_block_soft_cap: IDL.Opt(IDL.Nat64),
  max_chunk_size: IDL.Opt(IDL.Nat32),
  initial_notary_delay_millis: IDL.Opt(IDL.Nat64),
  max_artifact_streams_per_peer: IDL.Opt(IDL.Nat32),
  subnet_type: IDL.Opt(SubnetType),
  ssh_readonly_access: IDL.Opt(IDL.Vec(IDL.Text)),
});
export const UpdateSubnetReplicaVersionPayload = IDL.Record({
  subnet_id: IDL.Principal,
  replica_version_id: IDL.Text,
});
export const UpdateUnassignedNodesConfigPayload = IDL.Record({
  replica_version: IDL.Opt(IDL.Text),
  ssh_readonly_access: IDL.Opt(IDL.Vec(IDL.Text)),
});
