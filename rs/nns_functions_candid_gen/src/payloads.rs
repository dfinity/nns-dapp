use candid::CandidType;
use ic_base_types::{CanisterId, NodeId, PrincipalId, SubnetId};
use ic_registry_subnet_type::SubnetType;
use prost::Message;
use serde::{Deserialize, Serialize};

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

// https://gitlab.com/dfinity-lab/core/ic/-/blob/0ebe354b26d904326536d8725c8a5056f0ebb0d8/rs/registry/canister/src/mutations/do_update_subnet.rs#L51
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateSubnetPayload {
    pub subnet_id: SubnetId,

    pub ingress_bytes_per_block_soft_cap: Option<u64>,
    pub max_ingress_bytes_per_message: Option<u64>,
    pub max_block_payload_size: Option<u64>,
    pub unit_delay_millis: Option<u64>,
    pub initial_notary_delay_millis: Option<u64>,
    pub dkg_interval_length: Option<u64>,
    pub dkg_dealings_per_block: Option<u64>,

    pub max_artifact_streams_per_peer: Option<u32>,
    pub max_chunk_wait_ms: Option<u32>,
    pub max_duplicity: Option<u32>,
    pub max_chunk_size: Option<u32>,
    pub receive_check_cache_size: Option<u32>,
    pub pfn_evaluation_period_ms: Option<u32>,
    pub registry_poll_period_ms: Option<u32>,
    pub retransmission_request_ms: Option<u32>,
    pub advert_best_effort_percentage: Option<u32>,

    pub set_gossip_config_to_default: bool,

    pub start_as_nns: Option<bool>,

    pub subnet_type: Option<SubnetType>,

    pub is_halted: Option<bool>,

    pub max_instructions_per_message: Option<u64>,
    pub max_instructions_per_round: Option<u64>,
    pub max_instructions_per_install_code: Option<u64>,
    pub features: Option<SubnetFeatures>,

    pub max_number_of_canisters: Option<u64>,

    pub ssh_readonly_access: Option<Vec<String>>,
    pub ssh_backup_access: Option<Vec<String>>,
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
#[derive(CandidType, Deserialize, Clone, PartialEq, Eq, Message)]
pub struct SetFirewallConfigPayload {
    /// The firewall configuration content
    #[prost(string, tag = "1")]
    pub firewall_config: ::prost::alloc::string::String,
    /// List of allowed IPv4 prefixes
    #[prost(string, repeated, tag = "2")]
    pub ipv4_prefixes: ::prost::alloc::vec::Vec<::prost::alloc::string::String>,
    /// List of allowed IPv6 prefixes
    #[prost(string, repeated, tag = "3")]
    pub ipv6_prefixes: ::prost::alloc::vec::Vec<::prost::alloc::string::String>,
}

// https://github.com/dfinity-lab/dfinity/blob/bd842628a462dfa30604a2e2352fe50e9066d637/rs/registry/canister/src/mutations/do_add_node_operator.rs#L38
#[derive(CandidType, Deserialize, Clone, PartialEq, Eq, Message)]
pub struct AddNodeOperatorPayload {
    /// The principal id of the node operator. This principal is the entity that
    /// is able to add and remove nodes.
    ///
    /// This must be unique across NodeOperatorRecords.
    #[prost(message, optional, tag = "1")]
    pub node_operator_principal_id: Option<PrincipalId>,

    #[prost(message, optional, tag = "2")]
    pub node_provider_principal_id: Option<PrincipalId>,

    /// The remaining number of nodes that could be added by this Node Operator.
    #[prost(uint64, tag = "3")]
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

#[derive(CandidType, Deserialize, Clone, PartialEq, Eq, Message)]
pub struct UpdateNodeOperatorConfigPayload {
    /// The principal id of the node operator. This principal is the entity that
    /// is able to add and remove nodes.
    #[prost(message, optional, tag = "1")]
    pub node_operator_id: Option<PrincipalId>,

    /// The remaining number of nodes that could be added by this Node Operator.
    #[prost(message, optional, tag = "2")]
    pub node_allowance: Option<u64>,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/1e167e754b674f612e989cdee02acb79cfe40be8/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24
#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct UpdateNodeRewardsTableProposalPayload {
    /// Maps regions to the node reward rates in that region
    #[prost(btree_map="string, message", tag="1")]
    pub new_entries: ::prost::alloc::collections::BTreeMap<::prost::alloc::string::String, NodeRewardRates>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct NodeRewardRate {
    /// The number of 10,000ths of IMF SDR (currency code XDR) to be rewarded per
    /// node per month.
    #[prost(uint64, tag="1")]
    pub xdr_permyriad_per_node_per_month: u64,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct NodeRewardRates {
    /// Maps node types to the reward rate for that node type
    #[prost(btree_map="string, message", tag="1")]
    pub rates: ::prost::alloc::collections::BTreeMap<::prost::alloc::string::String, NodeRewardRate>,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/1e167e754b674f612e989cdee02acb79cfe40be8/rs/protobuf/def/registry/dc/v1/dc.proto#L27
#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct AddOrRemoveDataCentersProposalPayload {
    #[prost(message, repeated, tag="1")]
    pub data_centers_to_add: ::prost::alloc::vec::Vec<DataCenterRecord>,
    /// The IDs of data centers to remove
    #[prost(string, repeated, tag="2")]
    pub data_centers_to_remove: ::prost::alloc::vec::Vec<::prost::alloc::string::String>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct DataCenterRecord {
    #[prost(string, tag="1")]
    pub id: ::prost::alloc::string::String,
    #[prost(string, tag="2")]
    pub region: ::prost::alloc::string::String,
    #[prost(string, tag="3")]
    pub owner: ::prost::alloc::string::String,
    #[prost(message, optional, tag="4")]
    pub gps: ::core::option::Option<Gps>,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Message)]
pub struct Gps {
    #[prost(float, tag="1")]
    pub latitude: f32,
    #[prost(float, tag="2")]
    pub longitude: f32,
}

// https://gitlab.com/dfinity-lab/core/ic/-/blob/master/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L55
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct UpdateUnassignedNodesConfigPayload {
    pub ssh_readonly_access: Option<Vec<String>>,
    pub replica_version: Option<String>,
}
