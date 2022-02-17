use crate::proposals::def::{
    AddNnsCanisterProposalPayload, AddNnsCanisterProposalPayloadTrimmed, AddNodeOperatorPayload,
    AddNodesToSubnetPayload, AddOrRemoveDataCentersProposalPayload, BlessReplicaVersionPayload,
    ChangeNnsCanisterProposalPayload, ChangeNnsCanisterProposalPayloadTrimmed, CreateSubnetPayload,
    RecoverSubnetPayload, RemoveNodeOperatorsPayload, RemoveNodeOperatorsPayloadHumanReadable,
    RemoveNodesFromSubnetPayload, RemoveNodesPayload, RerouteCanisterRangePayload, SetAuthorizedSubnetworkListArgs,
    SetFirewallConfigPayload, StopOrStartNnsCanisterProposalPayload, UpdateIcpXdrConversionRatePayload,
    UpdateNodeOperatorConfigPayload, UpdateNodeRewardsTableProposalPayload, UpdateSubnetPayload,
    UpdateSubnetReplicaVersionPayload, UpdateUnassignedNodesConfigPayload, UpgradeRootProposalPayload,
    UpgradeRootProposalPayloadTrimmed,
};
use candid::CandidType;
use ic_base_types::CanisterId;
use ic_nns_governance::pb::v1::proposal::Action;
use ic_nns_governance::pb::v1::ProposalInfo;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;
use std::fmt::Debug;

thread_local! {
    // These are purposely not stored in stable memory.
    static CACHED_PROPOSALS: RefCell<HashMap<u64, Result<ProposalInfo, String>>> = RefCell::default();
}

pub async fn get_proposal(proposal_id: u64) -> Result<ProposalInfo, String> {
    if let Some(result) = CACHED_PROPOSALS.with(|c| c.borrow().get(&proposal_id).cloned()) {
        result
    } else {
        match crate::canisters::governance::get_proposal_info(proposal_id).await {
            Ok(Some(proposal_info)) => {
                let result = process_proposal(proposal_info);
                CACHED_PROPOSALS.with(|c| c.borrow_mut().insert(proposal_id, result.clone()));
                result
            }
            Ok(None) => Err("Proposal not found".to_string()), // We shouldn't cache this as the proposal may simply not exist yet
            Err(error) => Err(error), // We shouldn't cache this as the error may just be transient
        }
    }
}

// Check if the proposal has a payload, if yes, deserialize it then convert it to JSON.
fn process_proposal(mut proposal_info: ProposalInfo) -> Result<ProposalInfo, String> {
    if let Some(Action::ExecuteNnsFunction(f)) = proposal_info.proposal.as_mut().map(|p| p.action.as_mut()).flatten() {
        match transform_payload_to_json(f.nns_function, &f.payload) {
            Ok(json) => f.payload = json.into_bytes(),
            Err(_) => f.payload = b"Unable to deserialize payload".to_vec(),
        };
    }

    Ok(proposal_info)
}

fn transform_payload_to_json(nns_function: i32, payload_bytes: &[u8]) -> Result<String, String> {
    fn transform<In, Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType + DeserializeOwned + Into<Out>,
        Out: Serialize,
    {
        let payload: In = candid::decode_one(payload_bytes).map_err(debug)?;
        let payload_transformed: Out = payload.into();
        serde_json::to_string(&payload_transformed).map_err(debug)
    }

    fn identity<Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        Out: CandidType + Serialize + DeserializeOwned,
    {
        transform::<Out, Out>(payload_bytes)
    }

    match nns_function {
        1 => identity::<CreateSubnetPayload>(payload_bytes),
        2 => identity::<AddNodesToSubnetPayload>(payload_bytes),
        3 => transform::<AddNnsCanisterProposalPayload, AddNnsCanisterProposalPayloadTrimmed>(payload_bytes),
        4 => transform::<ChangeNnsCanisterProposalPayload, ChangeNnsCanisterProposalPayloadTrimmed>(payload_bytes),
        5 => identity::<BlessReplicaVersionPayload>(payload_bytes),
        6 => identity::<RecoverSubnetPayload>(payload_bytes),
        7 => identity::<UpdateSubnetPayload>(payload_bytes),
        8 => identity::<AddNodeOperatorPayload>(payload_bytes),
        9 => transform::<UpgradeRootProposalPayload, UpgradeRootProposalPayloadTrimmed>(payload_bytes),
        10 => identity::<UpdateIcpXdrConversionRatePayload>(payload_bytes),
        11 => identity::<UpdateSubnetReplicaVersionPayload>(payload_bytes),
        12 => Ok("No payload".to_string()),
        13 => identity::<RemoveNodesFromSubnetPayload>(payload_bytes),
        14 => identity::<SetAuthorizedSubnetworkListArgs>(payload_bytes),
        15 => identity::<SetFirewallConfigPayload>(payload_bytes),
        16 => identity::<UpdateNodeOperatorConfigPayload>(payload_bytes),
        17 => identity::<StopOrStartNnsCanisterProposalPayload>(payload_bytes),
        18 => identity::<RemoveNodesPayload>(payload_bytes),
        19 => identity::<CanisterId>(payload_bytes),
        20 => identity::<UpdateNodeRewardsTableProposalPayload>(payload_bytes),
        21 => identity::<AddOrRemoveDataCentersProposalPayload>(payload_bytes),
        22 => identity::<UpdateUnassignedNodesConfigPayload>(payload_bytes),
        23 => transform::<RemoveNodeOperatorsPayload, RemoveNodeOperatorsPayloadHumanReadable>(payload_bytes),
        24 => identity::<RerouteCanisterRangePayload>(payload_bytes),
        _ => Err("Unrecognised NNS function".to_string()),
    }
}

fn debug<T: Debug>(value: T) -> String {
    format!("{:?}", value)
}

mod def {
    use candid::CandidType;
    use ic_base_types::{CanisterId, CanisterInstallMode, NodeId, PrincipalId, SubnetId};
    use ic_crypto_sha::Sha256;
    use ic_nns_common::types::MethodAuthzChange;
    use ic_protobuf::registry::subnet::v1::EcdsaConfig;
    use ic_registry_subnet_features::SubnetFeatures;
    use ic_registry_subnet_type::SubnetType;
    use serde::{Deserialize, Serialize};
    use std::collections::BTreeMap;
    use std::convert::TryFrom;

    // NNS function 1 - CreateSubnet
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/7c811afe75f343cb3e7a9c65bd4294a86413a1d2/rs/registry/canister/src/mutations/do_create_subnet.rs#L195
    #[derive(CandidType, Serialize, Deserialize, Clone)]
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
        pub replica_version_id: String,
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
        pub advert_best_effort_percentage: Option<u32>,

        pub start_as_nns: bool,

        pub subnet_type: SubnetType,

        pub is_halted: bool,

        pub max_instructions_per_message: u64,
        pub max_instructions_per_round: u64,
        pub max_instructions_per_install_code: u64,

        pub features: SubnetFeatures,

        pub max_number_of_canisters: u64,
        pub ssh_readonly_access: Vec<String>,
        pub ssh_backup_access: Vec<String>,
    }

    // NNS function 2 - AddNodeToSubnet
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/7c811afe75f343cb3e7a9c65bd4294a86413a1d2/rs/registry/canister/src/mutations/do_add_nodes_to_subnet.rs#L43
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddNodesToSubnetPayload {
        /// The subnet ID to add the nodes to.
        pub subnet_id: PrincipalId,
        /// The list of node IDs that will be added to the existing subnet.
        pub node_ids: Vec<NodeId>,
    }

    // NNS function 3 - AddNNSCanister
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/nns/handlers/root/src/common.rs#L187
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddNnsCanisterProposalPayload {
        pub name: String,
        #[serde(with = "serde_bytes")]
        pub wasm_module: Vec<u8>,
        pub arg: Vec<u8>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub compute_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub memory_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub query_allocation: Option<candid::Nat>,
        pub initial_cycles: u64,
        pub authz_changes: Vec<MethodAuthzChange>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddNnsCanisterProposalPayloadTrimmed {
        pub name: String,
        pub wasm_module_hash: String,
        pub arg: Vec<u8>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub compute_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub memory_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub query_allocation: Option<candid::Nat>,
        pub initial_cycles: u64,
        pub authz_changes: Vec<MethodAuthzChange>,
    }

    impl From<AddNnsCanisterProposalPayload> for AddNnsCanisterProposalPayloadTrimmed {
        fn from(payload: AddNnsCanisterProposalPayload) -> Self {
            let wasm_module_hash = format!("{:x?}", calculate_hash(&payload.wasm_module));

            AddNnsCanisterProposalPayloadTrimmed {
                name: payload.name,
                wasm_module_hash,
                arg: payload.arg,
                compute_allocation: payload.compute_allocation,
                memory_allocation: payload.memory_allocation,
                query_allocation: payload.query_allocation,
                initial_cycles: payload.initial_cycles,
                authz_changes: payload.authz_changes,
            }
        }
    }

    // NNS function 4 - UpgradeNNSCanister
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/nns/handlers/root/src/common.rs#L74
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct ChangeNnsCanisterProposalPayload {
        pub stop_before_installing: bool,
        pub mode: CanisterInstallMode,
        pub canister_id: CanisterId,
        #[serde(with = "serde_bytes")]
        pub wasm_module: Vec<u8>,
        #[serde(with = "serde_bytes")]
        pub arg: Vec<u8>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub compute_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub memory_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub query_allocation: Option<candid::Nat>,
        pub authz_changes: Vec<MethodAuthzChange>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct ChangeNnsCanisterProposalPayloadTrimmed {
        pub stop_before_installing: bool,
        pub mode: CanisterInstallMode,
        pub canister_id: CanisterId,
        pub wasm_module_hash: String,
        #[serde(with = "serde_bytes")]
        pub arg: Vec<u8>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub compute_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub memory_allocation: Option<candid::Nat>,
        #[serde(serialize_with = "serialize_optional_nat")]
        pub query_allocation: Option<candid::Nat>,
        pub authz_changes: Vec<MethodAuthzChange>,
    }

    impl From<ChangeNnsCanisterProposalPayload> for ChangeNnsCanisterProposalPayloadTrimmed {
        fn from(payload: ChangeNnsCanisterProposalPayload) -> Self {
            let wasm_module_hash = format!("{:x?}", calculate_hash(&payload.wasm_module));

            ChangeNnsCanisterProposalPayloadTrimmed {
                stop_before_installing: payload.stop_before_installing,
                mode: payload.mode,
                canister_id: payload.canister_id,
                wasm_module_hash,
                arg: payload.arg,
                compute_allocation: payload.compute_allocation,
                memory_allocation: payload.memory_allocation,
                query_allocation: payload.query_allocation,
                authz_changes: payload.authz_changes,
            }
        }
    }

    // NNS function 5 - BlessReplicaVersion
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_bless_replica_version.rs#L83
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct BlessReplicaVersionPayload {
        pub replica_version_id: String,
        pub binary_url: String,
        pub sha256_hex: String,
        pub node_manager_binary_url: String,
        pub node_manager_sha256_hex: String,
        pub release_package_url: String,
        pub release_package_sha256_hex: String,
    }

    // NNS function 6 - RecoverSubnet
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_recover_subnet.rs#L229
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct RecoverSubnetPayload {
        pub subnet_id: PrincipalId,
        pub height: u64,
        pub time_ns: u64,
        pub state_hash: Vec<u8>,
        pub replacement_nodes: Option<Vec<NodeId>>,
        pub registry_store_uri: Option<(String, String, u64)>,
    }

    // NNS function 7 - UpdateSubnetConfig
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_update_subnet.rs#L52
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateSubnetPayload {
        pub subnet_id: SubnetId,

        pub max_ingress_bytes_per_message: Option<u64>,
        pub max_ingress_messages_per_block: Option<u64>,
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

        pub ecdsa_config: Option<EcdsaConfig>,

        pub max_number_of_canisters: Option<u64>,

        pub ssh_readonly_access: Option<Vec<String>>,
        pub ssh_backup_access: Option<Vec<String>>,
    }

    // NNS function 8 - AddNodeOperator
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_add_node_operator.rs#L38
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddNodeOperatorPayload {
        pub node_operator_principal_id: Option<PrincipalId>,
        pub node_provider_principal_id: Option<PrincipalId>,
        pub node_allowance: u64,
        pub dc_id: String,
        pub rewardable_nodes: BTreeMap<String, u32>,
    }

    // NNS function 9 - UpgradeRootCanister
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/nns/handlers/lifeline/lifeline.mo#L11
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeRootProposalPayload {
        #[serde(with = "serde_bytes")]
        pub module_arg: Vec<u8>,
        pub stop_upgrade_start: bool,
        #[serde(with = "serde_bytes")]
        pub wasm_module: Vec<u8>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeRootProposalPayloadTrimmed {
        #[serde(with = "serde_bytes")]
        pub module_arg: Vec<u8>,
        pub stop_upgrade_start: bool,
        pub wasm_module_hash: String,
    }

    impl From<UpgradeRootProposalPayload> for UpgradeRootProposalPayloadTrimmed {
        fn from(payload: UpgradeRootProposalPayload) -> Self {
            let wasm_module_hash = format!("{:x?}", calculate_hash(&payload.wasm_module));

            UpgradeRootProposalPayloadTrimmed {
                module_arg: payload.module_arg,
                stop_upgrade_start: payload.stop_upgrade_start,
                wasm_module_hash,
            }
        }
    }

    // NNS function 10 - UpdateIcpXdrConversionRate
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/nns/common/src/types.rs#L122
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateIcpXdrConversionRatePayload {
        pub data_source: String,
        pub timestamp_seconds: u64,
        pub xdr_permyriad_per_icp: u64,
    }

    // NNS function 11 - UpdateSubnetReplicaVersion
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_update_subnet_replica.rs#L58
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateSubnetReplicaVersionPayload {
        /// The subnet to update.
        pub subnet_id: PrincipalId, // SubnetId See NNS-73
        /// The new Replica version to use.
        pub replica_version_id: String,
    }

    // NNS function 13 - RemoveNodesFromSubnet
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_remove_nodes_from_subnet.rs#L49
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct RemoveNodesFromSubnetPayload {
        /// The list of Node IDs that will be removed from their subnet
        pub node_ids: Vec<NodeId>,
    }

    // NNS function 14 - SetAuthorizedSubnetworkList
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/623be8a22f6e2c4d50163e5422b07c762c392cd6/rs/nns/cmc/src/lib.rs#L88
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SetAuthorizedSubnetworkListArgs {
        pub who: Option<PrincipalId>,
        pub subnets: Vec<SubnetId>,
    }

    // NNS function 15 - SetFirewallConfig
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_set_firewall_config.rs#L39
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SetFirewallConfigPayload {
        pub firewall_config: String,
        pub ipv4_prefixes: Vec<String>,
        pub ipv6_prefixes: Vec<String>,
    }

    // NNS function 16 - UpdateNodeOperatorConfig
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_update_node_operator_config.rs#L80
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateNodeOperatorConfigPayload {
        pub node_operator_id: Option<PrincipalId>,
        pub node_allowance: Option<u64>,
        pub dc_id: Option<String>,
        pub rewardable_nodes: BTreeMap<String, u32>,
    }

    // NNS function 17 - StopOrStartNNSCanister
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/nns/handlers/root/src/common.rs#L258
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct StopOrStartNnsCanisterProposalPayload {
        pub canister_id: CanisterId,
        pub action: CanisterAction,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum CanisterAction {
        Stop,
        Start,
    }

    // NNS function 18 - RemoveNodesFromSubnet
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/registry/canister/src/mutations/do_remove_nodes.rs#L168
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct RemoveNodesPayload {
        /// The list of Node IDs that will be removed
        pub node_ids: Vec<NodeId>,
    }

    // NNS function 20 - UpdateNodeRewardsTable
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateNodeRewardsTableProposalPayload {
        /// Maps regions to the node reward rates in that region
        pub new_entries: BTreeMap<String, NodeRewardRates>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NodeRewardRate {
        /// The number of 10,000ths of IMF SDR (currency code XDR) to be rewarded per
        /// node per month.
        pub xdr_permyriad_per_node_per_month: u64,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct NodeRewardRates {
        /// Maps node types to the reward rate for that node type
        pub rates: BTreeMap<String, NodeRewardRate>,
    }

    // NNS function 21 - AddOrRemoveDataCenters
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/6dd50382a8dcdb451eed1469c3fc4be194151275/rs/protobuf/def/registry/dc/v1/dc.proto#L23
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddOrRemoveDataCentersProposalPayload {
        pub data_centers_to_add: Vec<DataCenterRecord>,
        /// The IDs of data centers to remove
        pub data_centers_to_remove: Vec<String>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DataCenterRecord {
        pub id: String,
        pub region: String,
        pub owner: String,
        pub gps: Option<Gps>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Gps {
        pub latitude: f32,
        pub longitude: f32,
    }

    // NNS function 22 - UpdateUnassignedNodes
    // https://gitlab.com/dfinity-lab/core/ic/-/blob/37201f2d611394581a30de9ea78cc742b3672ea4/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L55
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UpdateUnassignedNodesConfigPayload {
        pub ssh_readonly_access: Option<Vec<String>>,
        pub replica_version: Option<String>,
    }

    // NNS function 23 - RemoveNodeOperators
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/623be8a22f6e2c4d50163e5422b07c762c392cd6/rs/protobuf/def/registry/node_operator/v1/node_operator.proto#L32
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct RemoveNodeOperatorsPayload {
        pub node_operators_to_remove: Vec<Vec<u8>>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct RemoveNodeOperatorsPayloadHumanReadable {
        pub node_operators_to_remove: Vec<PrincipalId>,
    }

    impl From<RemoveNodeOperatorsPayload> for RemoveNodeOperatorsPayloadHumanReadable {
        fn from(payload: RemoveNodeOperatorsPayload) -> Self {
            RemoveNodeOperatorsPayloadHumanReadable {
                node_operators_to_remove: payload
                    .node_operators_to_remove
                    .into_iter()
                    .map(|o| PrincipalId::try_from(o).unwrap())
                    .collect(),
            }
        }
    }

    // NNS function 24 - RerouteCanisterRange
    // https://gitlab.com/dfinity-lab/public/ic/-/blob/623be8a22f6e2c4d50163e5422b07c762c392cd6/rs/registry/canister/src/mutations/reroute_canister_range.rs#L46
    #[derive(CandidType, Serialize, Deserialize, Clone)]
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

    // Use a serde field attribute to custom serialize the Nat candid type.
    fn serialize_optional_nat<S>(nat: &Option<candid::Nat>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match nat.as_ref() {
            Some(num) => serializer.serialize_str(&num.to_string()),
            None => serializer.serialize_none(),
        }
    }

    fn calculate_hash(bytes: &[u8]) -> [u8; 32] {
        let mut wasm_sha = Sha256::new();
        wasm_sha.write(&bytes);
        wasm_sha.finish()
    }
}
