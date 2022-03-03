use candid::CandidType;
use ic_base_types::{CanisterId, NodeId, PrincipalId, SubnetId};
use ic_registry_subnet_type::SubnetType;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_add_nodes_to_subnet.rs#L42
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AddNodesToSubnetPayload {
    /// The subnet ID to add the nodes to.
    pub subnet_id: PrincipalId,
    /// The list of node IDs that will be added to the existing subnet.
    pub node_ids: Vec<NodeId>,
}

#[derive(CandidType, Clone, Copy, Default, Deserialize, Debug, Eq, PartialEq, Serialize)]
pub struct SubnetFeatures {
    pub ecdsa_signatures: bool,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_create_subnet.rs#L233
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct CreateSubnetPayload {
    /// The list of node IDs that will be part of the new subnet.
    pub node_ids: Vec<NodeId>,

    pub subnet_id_override: Option<PrincipalId>,

    pub ingress_bytes_per_block_soft_cap: u64,
    pub max_ingress_bytes_per_message: u64,
    pub max_ingress_messages_per_block: u64,
    pub max_block_payload_size: u64,
    pub unit_delay_millis: u64,
    pub initial_notary_delay_millis: u64,
    pub replica_version_id: std::string::String,
    pub dkg_interval_length: u64,
    pub dkg_dealings_per_block: u64,

    pub gossip_max_artifact_streams_per_peer: u32,
    pub gossip_max_chunk_wait_ms: u32,
    pub gossip_max_duplicity: u32,
    pub gossip_max_chunk_size: u32,
    pub gossip_receive_check_cache_size: u32,
    pub gossip_pfn_evaluation_period_ms: u32,
    pub gossip_registry_poll_period_ms: u32,
    pub gossip_retransmission_request_ms: u32,

    pub start_as_nns: bool,

    pub subnet_type: SubnetType,

    pub is_halted: bool,

    pub max_instructions_per_message: u64,
    pub max_instructions_per_round: u64,
    pub max_instructions_per_install_code: u64,

    pub features: SubnetFeatures,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_bless_replica_version.rs#L87
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct BlessReplicaVersionPayload {
    /// Version ID. This can be anything, it has not semantics. The reason it is
    /// part of the payload is that it will be needed in the subsequent step
    /// of upgrading individual subnets.
    pub replica_version_id: String,

    /// The URL against which a HTTP GET request will return a replica binary
    /// that corresponds to this version
    pub binary_url: String,

    /// The hex-formatted SHA-256 hash of the binary served by 'binary_url'
    pub sha256_hex: String,

    /// The URL against which a HTTP GET request will return a node manager
    /// binary that corresponds to this version
    pub node_manager_binary_url: String,

    /// The hex-formatted SHA-256 hash of the binary served by
    /// 'node_manager_binary_url'
    pub node_manager_sha256_hex: String,

    /// The URL against which a HTTP GET request will return a release package
    /// that corresponds to this version
    pub release_package_url: String,

    /// The hex-formatted SHA-256 hash of the archive file served by
    /// 'release_package_url'
    pub release_package_sha256_hex: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateSubnetPayload {
    // Entries are from: https://gitlab.com/dfinity-lab/public/ic/-/blob/bd95c0f9a9c8e04c7124e98f3d12c8dd9cae1681/rs/registry/canister/canister/registry.did
    // ecdsa_config <-- Omitted for some reason.
    // pub ingress_bytes_per_block_soft_cap: Option<u64>, <-- Not upstream.
    pub advert_best_effort_percentage: Option<u32>,
    pub dkg_dealings_per_block: Option<u64>,
    pub dkg_interval_length: Option<u64>,
    pub features: Option<SubnetFeatures>,
    pub initial_notary_delay_millis: Option<u64>,
    pub is_halted: Option<bool>,
    pub max_artifact_streams_per_peer: Option<u32>,
    pub max_block_payload_size: Option<u64>,
    pub max_chunk_size: Option<u32>,
    pub max_chunk_wait_ms: Option<u32>,
    pub max_duplicity: Option<u32>,
    pub max_ingress_bytes_per_message: Option<u64>,
    pub max_ingress_messages_per_block: Option<u64>,
    pub max_instructions_per_install_code: Option<u64>,
    pub max_instructions_per_message: Option<u64>,
    pub max_instructions_per_round: Option<u64>,
    pub max_number_of_canisters: Option<u64>,
    pub pfn_evaluation_period_ms: Option<u32>,
    pub receive_check_cache_size: Option<u32>,
    pub registry_poll_period_ms: Option<u32>,
    pub retransmission_request_ms: Option<u32>,
    pub set_gossip_config_to_default: bool,
    pub ssh_backup_access: Option<Vec<String>>,
    pub ssh_readonly_access: Option<Vec<String>>,
    pub start_as_nns: Option<bool>,
    pub subnet_id: SubnetId,
    pub subnet_type: Option<SubnetType>,
    pub unit_delay_millis: Option<u64>,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_recover_subnet.rs#L141
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct RecoverSubnetPayload {
    /// The subnet ID to add the recovery CUP to
    pub subnet_id: PrincipalId,
    /// The height of the CUP
    pub height: u64,
    /// The block time to start from (nanoseconds from Epoch)
    pub time_ns: u64,
    /// The hash of the state
    pub state_hash: Vec<u8>,
    /// Replace the members of the given subnet with these nodes
    pub replacement_nodes: Option<Vec<NodeId>>,
    /// A uri from which data to replace the registry local store should be
    /// downloaded
    pub registry_store_uri: Option<(String, String, u64)>,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_set_firewall_config.rs#L38
#[derive(CandidType, Deserialize, Clone, PartialEq, Eq)]
pub struct SetFirewallConfigPayload {
    /// The firewall configuration content
    pub firewall_config: String,
    /// List of allowed IPv4 prefixes
    pub ipv4_prefixes: Vec<String>,
    /// List of allowed IPv6 prefixes
    pub ipv6_prefixes: Vec<String>,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_add_node_operator.rs#L38
#[derive(CandidType, Deserialize, Clone, PartialEq, Eq)]
pub struct AddNodeOperatorPayload {
    /// The principal id of the node operator. This principal is the entity that
    /// is able to add and remove nodes.
    ///
    /// This must be unique across NodeOperatorRecords.
    pub node_operator_principal_id: Option<PrincipalId>,

    pub node_provider_principal_id: Option<PrincipalId>,

    /// The remaining number of nodes that could be added by this Node Operator.
    pub node_allowance: u64,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_update_icp_xdr_conversion_rate.rs#L41
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateIcpXdrConversionRatePayload {
    pub data_source: String,
    pub timestamp_seconds: u64,
    pub xdr_permyriad_per_icp: u64,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_update_subnet_replica.rs#L88
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateSubnetReplicaVersionPayload {
    /// The subnet to update.
    pub subnet_id: PrincipalId, // SubnetId See NNS-73
    /// The new Replica version to use.
    pub replica_version_id: String,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_remove_nodes_from_subnet.rs#L48
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct RemoveNodesFromSubnetPayload {
    /// The list of Node IDs that will be removed from their subnet
    pub node_ids: Vec<NodeId>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum CanisterAction {
    Stop,
    Start,
}

// https://github.com/dfinity-lab/dfinity/blob/349420cc17cdab85827a5584886e377bf38ec9a6/rs/nns/handlers/root/src/common.rs#L180
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct StopOrStartNnsCanisterProposalPayload {
    pub canister_id: CanisterId,
    pub action: CanisterAction,
}

#[derive(Serialize, Deserialize, CandidType, Clone, Hash, Debug, PartialEq, Eq)]
pub struct SetAuthorizedSubnetworkListArgs {
    pub who: Option<PrincipalId>,
    pub subnets: Vec<SubnetId>,
}

// https://gitlab.com/dfinity-lab/public/ic/-/blob/7061a8357f5a2d196d19654bc540f7aab56418b6/rs/registry/canister/src/mutations/do_update_node_operator_config.rs#L89
#[derive(CandidType, Deserialize, Clone, PartialEq, Eq)]
pub struct UpdateNodeOperatorConfigPayload {
    /// The principal id of the node operator. This principal is the entity that
    /// is able to add and remove nodes.
    pub node_operator_id: Option<PrincipalId>,

    /// The remaining number of nodes that could be added by this Node Operator.
    pub node_allowance: Option<u64>,

    /// The ID of the data center where this Node Operator hosts nodes.
    pub dc_id: Option<String>,

    /// A map from node type to the number of nodes for which the associated
    /// Node Provider should be rewarded.
    pub rewardable_nodes: BTreeMap<String, u32>,

    /// The principal id of this node's provider.
    pub node_provider_id: Option<PrincipalId>,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/1e167e754b674f612e989cdee02acb79cfe40be8/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24
#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct UpdateNodeRewardsTableProposalPayload {
    /// Maps regions to the node reward rates in that region
    pub new_entries: BTreeMap<String, NodeRewardRates>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct NodeRewardRate {
    /// The number of 10,000ths of IMF SDR (currency code XDR) to be rewarded per
    /// node per month.
    pub xdr_permyriad_per_node_per_month: u64,
}

#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct NodeRewardRates {
    /// Maps node types to the reward rate for that node type
    pub rates: BTreeMap<String, NodeRewardRate>,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/1e167e754b674f612e989cdee02acb79cfe40be8/rs/protobuf/def/registry/dc/v1/dc.proto#L27
#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct AddOrRemoveDataCentersProposalPayload {
    pub data_centers_to_add: Vec<DataCenterRecord>,
    /// The IDs of data centers to remove
    pub data_centers_to_remove: Vec<String>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct DataCenterRecord {
    pub id: String,
    pub region: String,
    pub owner: String,
    pub gps: Option<Gps>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq)]
pub struct Gps {
    pub latitude: f32,
    pub longitude: f32,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/master/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L55
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateUnassignedNodesConfigPayload {
    pub ssh_readonly_access: Option<Vec<String>>,
    pub replica_version: Option<String>,
}

// https://gitlab.com/dfinity-lab/public/ic/-/blob/9527797958c2e02c8d975190e10c72efbb164646/rs/protobuf/def/registry/node_operator/v1/node_operator.proto#L32
//// The payload of a request to remove Node Operator records from the Registry
#[derive(candid::CandidType, serde::Serialize, candid::Deserialize, Clone, PartialEq)]
pub struct RemoveNodeOperatorsPayload {
    pub node_operators_to_remove: Vec<Vec<u8>>,
}

// https://gitlab.com/dfinity-lab/public/ic/-/blob/9527797958c2e02c8d975190e10c72efbb164646/rs/registry/canister/src/mutations/reroute_canister_range.rs#L46
/// The argument for the `reroute_canister_range` update call.
#[derive(Debug, CandidType, Serialize, Deserialize)]
pub struct RerouteCanisterRangePayload {
    /// The first canister id in the range that needs to be mapped to the new
    /// destination.
    pub range_start_inclusive: PrincipalId,
    /// The last canister id in the range that needs to be mapped to the new
    /// destination.
    pub range_end_inclusive: PrincipalId,
    /// The new destination for the canister id range.
    pub destination_subnet: PrincipalId,
}
