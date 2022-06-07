use crate::proposals::def::{
    AddNnsCanisterProposal, AddNnsCanisterProposalTrimmed, AddNodeOperatorPayload, AddNodesToSubnetPayload,
    AddOrRemoveDataCentersProposalPayload, BlessReplicaVersionPayload, ChangeNnsCanisterProposal,
    ChangeNnsCanisterProposalTrimmed, CreateSubnetPayload, RecoverSubnetPayload, RemoveNodeOperatorsPayload,
    RemoveNodeOperatorsPayloadHumanReadable, RemoveNodesFromSubnetPayload, RemoveNodesPayload,
    RerouteCanisterRangePayload, SetAuthorizedSubnetworkListArgs, SetFirewallConfigPayload,
    StopOrStartNnsCanisterProposal, UpdateIcpXdrConversionRatePayload, UpdateNodeOperatorConfigPayload,
    UpdateNodeRewardsTableProposalPayload, UpdateSubnetPayload, UpdateSubnetReplicaVersionPayload,
    UpdateUnassignedNodesConfigPayload, UpgradeRootProposalPayload, UpgradeRootProposalPayloadTrimmed,
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

type Json = String;

thread_local! {
    // These are purposely not stored in stable memory.
    static CACHED_PROPOSAL_PAYLOADS: RefCell<HashMap<u64, Result<Json, String>>> = RefCell::default();
}

pub async fn get_proposal_payload(proposal_id: u64) -> Result<Json, String> {
    if let Some(result) = CACHED_PROPOSAL_PAYLOADS.with(|c| c.borrow().get(&proposal_id).cloned()) {
        result
    } else {
        match crate::canisters::governance::get_proposal_info(proposal_id).await {
            Ok(Some(proposal_info)) => {
                let json = process_proposal(proposal_info);
                CACHED_PROPOSAL_PAYLOADS.with(|c| c.borrow_mut().insert(proposal_id, Ok(json.clone())));
                result
            }
            Ok(None) => Err("Proposal not found".to_string()), // We shouldn't cache this as the proposal may simply not exist yet
            Err(error) => Err(error), // We shouldn't cache this as the error may just be transient
        }
    }
}

// Check if the proposal has a payload, if yes, deserialize it then convert it to JSON.
fn process_proposal_payload(proposal_info: ProposalInfo) -> Json {
    if let Some(Action::ExecuteNnsFunction(f)) = proposal_info.proposal.as_ref().map(|p| p.action.as_ref()).flatten() {
        transform_payload_to_json(f.nns_function, &f.payload).unwrap_or_else(|_| "Unable to deserialize payload".to_string())
    } else {
        "Proposal has no payload".to_string()
    }
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
        3 => transform::<AddNnsCanisterProposal, AddNnsCanisterProposalTrimmed>(payload_bytes),
        4 => transform::<ChangeNnsCanisterProposal, ChangeNnsCanisterProposalTrimmed>(payload_bytes),
        5 => identity::<BlessReplicaVersionPayload>(payload_bytes),
        6 => identity::<RecoverSubnetPayload>(payload_bytes),
        7 => identity::<UpdateSubnetPayload>(payload_bytes),
        8 => identity::<AddNodeOperatorPayload>(payload_bytes),
        9 => transform::<UpgradeRootProposalPayload, UpgradeRootProposalPayloadTrimmed>(payload_bytes),
        10 => identity::<UpdateIcpXdrConversionRatePayload>(payload_bytes),
        11 => identity::<UpdateSubnetReplicaVersionPayload>(payload_bytes),
        12 => Ok("Proposal has no payload".to_string()),
        13 => identity::<RemoveNodesFromSubnetPayload>(payload_bytes),
        14 => identity::<SetAuthorizedSubnetworkListArgs>(payload_bytes),
        15 => identity::<SetFirewallConfigPayload>(payload_bytes),
        16 => identity::<UpdateNodeOperatorConfigPayload>(payload_bytes),
        17 => identity::<StopOrStartNnsCanisterProposal>(payload_bytes),
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
    use ic_base_types::{CanisterId, PrincipalId};
    use ic_crypto_sha::Sha256;
    use ic_ic00_types::CanisterInstallMode;
    use ic_nervous_system_common::MethodAuthzChange;
    use serde::{Deserialize, Serialize};
    use std::convert::TryFrom;

    // NNS function 1 - CreateSubnet
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_create_subnet.rs#L248
    pub type CreateSubnetPayload = registry_canister::mutations::do_create_subnet::CreateSubnetPayload;

    // NNS function 2 - AddNodeToSubnet
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_add_nodes_to_subnet.rs#L51
    pub type AddNodesToSubnetPayload = registry_canister::mutations::do_add_nodes_to_subnet::AddNodesToSubnetPayload;

    // NNS function 3 - AddNNSCanister
    // https://github.com/dfinity/ic/blob/fba1b63a8c6bd1d49510c10f85fe6d1668089422/rs/nervous_system/root/src/lib.rs#L192
    pub type AddNnsCanisterProposal = ic_nervous_system_root::AddCanisterProposal;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AddNnsCanisterProposalTrimmed {
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

    impl From<AddNnsCanisterProposal> for AddNnsCanisterProposalTrimmed {
        fn from(payload: AddNnsCanisterProposal) -> Self {
            let wasm_module_hash = calculate_hash_string(&payload.wasm_module);

            AddNnsCanisterProposalTrimmed {
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
    // https://github.com/dfinity/ic/blob/fba1b63a8c6bd1d49510c10f85fe6d1668089422/rs/nervous_system/root/src/lib.rs#L75
    pub type ChangeNnsCanisterProposal = ic_nervous_system_root::ChangeCanisterProposal;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct ChangeNnsCanisterProposalTrimmed {
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

    impl From<ChangeNnsCanisterProposal> for ChangeNnsCanisterProposalTrimmed {
        fn from(payload: ChangeNnsCanisterProposal) -> Self {
            let wasm_module_hash = calculate_hash_string(&payload.wasm_module);

            ChangeNnsCanisterProposalTrimmed {
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
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_bless_replica_version.rs#L83
    pub type BlessReplicaVersionPayload =
        registry_canister::mutations::do_bless_replica_version::BlessReplicaVersionPayload;

    // NNS function 6 - RecoverSubnet
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_recover_subnet.rs#L249
    pub type RecoverSubnetPayload = registry_canister::mutations::do_recover_subnet::RecoverSubnetPayload;

    // NNS function 7 - UpdateSubnetConfig
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_update_subnet.rs#L159
    pub type UpdateSubnetPayload = registry_canister::mutations::do_update_subnet::UpdateSubnetPayload;

    // NNS function 8 - AddNodeOperator
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_add_node_operator.rs#L40
    pub type AddNodeOperatorPayload = registry_canister::mutations::do_add_node_operator::AddNodeOperatorPayload;

    // NNS function 9 - UpgradeRootCanister
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/handlers/lifeline/lifeline.mo#L11
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
            let wasm_module_hash = calculate_hash_string(&payload.wasm_module);

            UpgradeRootProposalPayloadTrimmed {
                module_arg: payload.module_arg,
                stop_upgrade_start: payload.stop_upgrade_start,
                wasm_module_hash,
            }
        }
    }

    // NNS function 10 - UpdateIcpXdrConversionRate
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/common/src/types.rs#L89
    #[derive(CandidType, Default, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
    pub struct UpdateIcpXdrConversionRatePayload {
        pub data_source: String,
        pub timestamp_seconds: u64,
        pub xdr_permyriad_per_icp: u64,
    }

    // NNS function 11 - UpdateSubnetReplicaVersion
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_update_subnet_replica.rs#L58
    pub type UpdateSubnetReplicaVersionPayload =
        registry_canister::mutations::do_update_subnet_replica::UpdateSubnetReplicaVersionPayload;

    // NNS function 13 - RemoveNodesFromSubnet
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_remove_nodes_from_subnet.rs#L57
    pub type RemoveNodesFromSubnetPayload =
        registry_canister::mutations::do_remove_nodes_from_subnet::RemoveNodesFromSubnetPayload;

    // NNS function 14 - SetAuthorizedSubnetworkList
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/cmc/src/lib.rs#L168
    pub type SetAuthorizedSubnetworkListArgs = cycles_minting_canister::SetAuthorizedSubnetworkListArgs;

    // NNS function 15 - SetFirewallConfig
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_set_firewall_config.rs#L39
    pub type SetFirewallConfigPayload = registry_canister::mutations::do_set_firewall_config::SetFirewallConfigPayload;

    // NNS function 16 - UpdateNodeOperatorConfig
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_update_node_operator_config.rs#L106
    pub type UpdateNodeOperatorConfigPayload =
        registry_canister::mutations::do_update_node_operator_config::UpdateNodeOperatorConfigPayload;

    // NNS function 17 - StopOrStartNNSCanister
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nervous_system/root/src/lib.rs#L258
    pub type StopOrStartNnsCanisterProposal = ic_nervous_system_root::StopOrStartCanisterProposal;

    // NNS function 18 - RemoveNodes
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/node_management/do_remove_nodes.rs#L96
    pub type RemoveNodesPayload = registry_canister::mutations::node_management::do_remove_nodes::RemoveNodesPayload;

    // NNS function 20 - UpdateNodeRewardsTable
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24
    pub type UpdateNodeRewardsTableProposalPayload =
        ic_protobuf::registry::node_rewards::v2::UpdateNodeRewardsTableProposalPayload;

    // NNS function 21 - AddOrRemoveDataCenters
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/dc/v1/dc.proto#L23
    pub type AddOrRemoveDataCentersProposalPayload =
        ic_protobuf::registry::dc::v1::AddOrRemoveDataCentersProposalPayload;

    // NNS function 22 - UpdateUnassignedNodes
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L62
    pub type UpdateUnassignedNodesConfigPayload =
        registry_canister::mutations::do_update_unassigned_nodes_config::UpdateUnassignedNodesConfigPayload;

    // NNS function 23 - RemoveNodeOperators
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/node_operator/v1/node_operator.proto#L34
    pub type RemoveNodeOperatorsPayload = ic_protobuf::registry::node_operator::v1::RemoveNodeOperatorsPayload;

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
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/registry/canister/src/mutations/reroute_canister_range.rs#L46
    pub type RerouteCanisterRangePayload =
        registry_canister::mutations::reroute_canister_range::RerouteCanisterRangePayload;

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

    fn calculate_hash_string(bytes: &[u8]) -> String {
        let mut hash_string = String::with_capacity(64);
        for byte in calculate_hash(bytes) {
            hash_string.push_str(&format!("{:02x}", byte));
        }
        hash_string
    }

    fn calculate_hash(bytes: &[u8]) -> [u8; 32] {
        let mut wasm_sha = Sha256::new();
        wasm_sha.write(bytes);
        wasm_sha.finish()
    }
}

#[cfg(test)]
mod payloads;
#[cfg(test)]
mod tests;
