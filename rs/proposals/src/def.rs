//! NNS proposal functions.
//!
//! If a proposal is passed, the governance canister will typically execute a function call specified in the proposal.
//! This function call is typically one of the following:
//! - An update call on some canister, in which case the types are defined in the code of the target canister.
//! - A call to install or upgrade a canister.
//!
//! Thus the types come from a variety of sources.  Each type is annotated with a versioned URL that points to the source of the type.  Updates are NOT automated yet.
#![allow(missing_docs)]
use crate::{
    canister_arg_types,
    canisters::sns_wasm::api::{SnsUpgrade, SnsVersion},
    decode_arg, Json,
};

use candid::{CandidType, Principal};
use ic_base_types::{CanisterId, PrincipalId};
use ic_crypto_sha2::Sha256;
use ic_management_canister_types::CanisterInstallMode;
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use std::fmt::Write;

// NNS function 1 - CreateSubnet
// https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_create_subnet.rs#L248
pub type CreateSubnetPayload = crate::canisters::nns_registry::api::CreateSubnetPayload;

// NNS function 2 - AddNodeToSubnet
// https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_add_nodes_to_subnet.rs#L51
pub type AddNodesToSubnetPayload = crate::canisters::nns_registry::api::AddNodesToSubnetPayload;

// NNS function 3 - AddNNSCanister
// https://github.com/dfinity/ic/blob/a8e25a31ae9c649708405f2d4c3d058fdd730be2/rs/nervous_system/root/src/change_canister.rs#L137
// Renamed to AddNnsCanisterProposal
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct AddNnsCanisterProposal {
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
}

// replace `wasm_module` with `wasm_module_hash`
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct AddNnsCanisterProposalTrimmed {
    pub name: String,
    pub wasm_module_hash: String,
    pub arg: Json,
    pub arg_hex: String,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub compute_allocation: Option<candid::Nat>,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub memory_allocation: Option<candid::Nat>,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub query_allocation: Option<candid::Nat>,
    pub initial_cycles: u64,
}

impl From<AddNnsCanisterProposal> for AddNnsCanisterProposalTrimmed {
    fn from(payload: AddNnsCanisterProposal) -> Self {
        let wasm_module_hash = calculate_hash_string(&payload.wasm_module);
        let candid_arg = decode_arg(&payload.arg, &canister_arg_types(None));

        AddNnsCanisterProposalTrimmed {
            name: payload.name,
            wasm_module_hash,
            arg: candid_arg,
            arg_hex: hex::encode(&payload.arg),
            compute_allocation: payload.compute_allocation,
            memory_allocation: payload.memory_allocation,
            query_allocation: payload.query_allocation,
            initial_cycles: payload.initial_cycles,
        }
    }
}

// NNS function 4 - UpgradeNNSCanister
// https://github.com/dfinity/ic/blob/a8e25a31ae9c649708405f2d4c3d058fdd730be2/rs/nervous_system/root/src/change_canister.rs#L19
// Renamed to ChangeNnsCanisterProposal
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ChangeNnsCanisterProposal {
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
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ChangeNnsCanisterProposalTrimmed {
    pub stop_before_installing: bool,
    pub mode: CanisterInstallMode,
    pub canister_id: CanisterId,
    pub wasm_module_hash: String,
    pub arg: Json,
    pub arg_hex: String,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub compute_allocation: Option<candid::Nat>,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub memory_allocation: Option<candid::Nat>,
    #[serde(serialize_with = "serialize_optional_nat")]
    pub query_allocation: Option<candid::Nat>,
}

impl From<ChangeNnsCanisterProposal> for ChangeNnsCanisterProposalTrimmed {
    fn from(payload: ChangeNnsCanisterProposal) -> Self {
        let wasm_module_hash = calculate_hash_string(&payload.wasm_module);
        let candid_arg = decode_arg(&payload.arg, &canister_arg_types(Some(payload.canister_id)));

        ChangeNnsCanisterProposalTrimmed {
            stop_before_installing: payload.stop_before_installing,
            mode: payload.mode,
            canister_id: payload.canister_id,
            wasm_module_hash,
            arg: candid_arg,
            arg_hex: hex::encode(&payload.arg),
            compute_allocation: payload.compute_allocation,
            memory_allocation: payload.memory_allocation,
            query_allocation: payload.query_allocation,
        }
    }
}

// NNS function 6 - RecoverSubnet
// https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_recover_subnet.rs#L249
pub type RecoverSubnetPayload = crate::canisters::nns_registry::api::RecoverSubnetPayload;

// NNS function 7 - UpdateSubnetConfig
// https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_subnet.rs#L159
pub type UpdateSubnetPayload = crate::canisters::nns_registry::api::UpdateSubnetPayload;

// NNS function 8 - AddNodeOperator
// https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_add_node_operator.rs#L40
pub type AddNodeOperatorPayload = crate::canisters::nns_registry::api::AddNodeOperatorPayload;

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

/// NNS function 11 - `UpdateSubnetReplicaVersion`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_subnet_replica.rs#L58>
pub type DeployGuestosToAllSubnetNodesPayload =
    crate::canisters::nns_registry::api::DeployGuestosToAllSubnetNodesPayload;

/// NNS function 13 - `RemoveNodesFromSubnet`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_remove_nodes_from_subnet.rs#L57>
pub type RemoveNodesFromSubnetPayload = crate::canisters::nns_registry::internal::RemoveNodesFromSubnetPayload;

/// NNS function 14 - `SetAuthorizedSubnetworkList`
/// <https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/cmc/src/lib.rs#L168>
pub type SetAuthorizedSubnetworkListArgs = cycles_minting_canister::SetAuthorizedSubnetworkListArgs;

/// NNS function 15 - `SetFirewallConfig`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_set_firewall_config.rs#L39>
pub type SetFirewallConfigPayload = crate::canisters::nns_registry::api::SetFirewallConfigPayload;

/// NNS function 16 - `UpdateNodeOperatorConfig`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_node_operator_config.rs#L106>
pub type UpdateNodeOperatorConfigPayload = crate::canisters::nns_registry::api::UpdateNodeOperatorConfigPayload;

/// NNS function 17 - `StopOrStartNNSCanister`
/// <https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nervous_system/root/src/lib.rs#L258>
pub type StopOrStartNnsCanisterProposal = ic_nervous_system_root::change_canister::StopOrStartCanisterRequest;

/// NNS function 18 - `RemoveNodes`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/node_management/do_remove_nodes.rs#L96>
pub type RemoveNodesPayload = crate::canisters::nns_registry::api::RemoveNodesPayload;

/// NNS function 20 - `UpdateNodeRewardsTable`
/// <https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24>
pub type UpdateNodeRewardsTableProposalPayload =
    ic_protobuf::registry::node_rewards::v2::UpdateNodeRewardsTableProposalPayload;

/// NNS function 21 - `AddOrRemoveDataCenters`
/// <https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/dc/v1/dc.proto#L23>
pub type AddOrRemoveDataCentersProposalPayload = ic_protobuf::registry::dc::v1::AddOrRemoveDataCentersProposalPayload;

/// NNS function 22 - `UpdateUnassignedNodes`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L62>
pub type UpdateUnassignedNodesConfigPayload = crate::canisters::nns_registry::api::UpdateUnassignedNodesConfigPayload;

/// NNS function 23 - `RemoveNodeOperators`
/// <https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/node_operator/v1/node_operator.proto#L34>
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

/// NNS function 24 - `RerouteCanisterRange`
/// <https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/reroute_canister_ranges.rs#L66>
pub type RerouteCanisterRangesPayload = crate::canisters::nns_registry::api::RerouteCanisterRangesPayload;

/// NNS function 25 - `AddFirewallRules`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L218>
pub type AddFirewallRulesPayload = crate::canisters::nns_registry::api::AddFirewallRulesPayload;

/// NNS function 26 - `RemoveFirewallRules`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L233>
pub type RemoveFirewallRulesPayload = crate::canisters::nns_registry::api::RemoveFirewallRulesPayload;

/// NNS function 27 - `UpdateFirewallRules`
/// <https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L246>
pub type UpdateFirewallRulesPayload = crate::canisters::nns_registry::internal::UpdateFirewallRulesPayload;

/// NNS function 28 - `PrepareCanisterMigration`
/// <https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/prepare_canister_migration.rs#L67>
pub type PrepareCanisterMigrationPayload = crate::canisters::nns_registry::api::PrepareCanisterMigrationPayload;

/// NNS function 29 - `CompleteCanisterMigration`
/// <https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/complete_canister_migration.rs#L34>
pub type CompleteCanisterMigrationPayload = crate::canisters::nns_registry::api::CompleteCanisterMigrationPayload;

/// NNS function 30 - `AddSnsWasm`
/// <https://github.com/dfinity/ic/blob/187e933e73867efc3993572abc6344b8cedfafe5/rs/nns/sns-wasm/gen/ic_sns_wasm.pb.v1.rs#L62>
pub type AddWasmRequest = crate::canisters::sns_wasm::api::AddWasmRequest;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct SnsWasmTrimmed {
    pub wasm_hash: String,
    pub canister_type: i32,
}

// replace `wasm_module` with `wasm_module_hash`
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct AddWasmRequestTrimmed {
    pub wasm: Option<SnsWasmTrimmed>,
    pub hash: String,
}

impl From<AddWasmRequest> for AddWasmRequestTrimmed {
    fn from(payload: AddWasmRequest) -> Self {
        AddWasmRequestTrimmed {
            wasm: payload.wasm.map(|w| SnsWasmTrimmed {
                wasm_hash: calculate_hash_string(&w.wasm),
                canister_type: w.canister_type,
            }),
            hash: format_bytes(&payload.hash),
        }
    }
}

/// NNS function 31 - `ChangeSubnetMembership`
/// The payload of a proposal to change the membership of nodes in an existing subnet.
/// <https://github.com/dfinity/ic/blob/f74c23fe475aa9545f936748e2506f609aa4be8d/rs/registry/canister/src/mutations/do_change_subnet_membership.rs#L71>
pub type ChangeSubnetMembershipPayload = crate::canisters::nns_registry::api::ChangeSubnetMembershipPayload;

/// NNS function 32 - `UpdateSubnetType`
/// Updates the available subnet types in the cycles minting canister.
/// <https://github.com/dfinity/ic/blob/2ff38b1c305302e96aa85c7aa1f1e3811aa84819/rs/nns/cmc/src/lib.rs#L179>
pub type UpdateSubnetTypeArgs = cycles_minting_canister::UpdateSubnetTypeArgs;

/// NNS function 33 - `ChangeSubnetTypeAssignment`
/// Changes the assignment of subnets to subnet types in the cycles minting canister.
/// <https://github.com/dfinity/ic/blob/503fb9ad621f7ab979b3c874365170c37fe444ba/rs/nns/cmc/src/lib.rs#L227>
pub type ChangeSubnetTypeAssignmentArgs = cycles_minting_canister::ChangeSubnetTypeAssignmentArgs;

/// Uses a `serde` field attribute to custom serialize the Nat candid type.
fn serialize_optional_nat<S>(nat: &Option<candid::Nat>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    match nat.as_ref() {
        Some(num) => serializer.serialize_str(&num.to_string()),
        None => serializer.serialize_none(),
    }
}

/// Calculates the SHA256 hash of the given bytes and returns it as a hex string.
fn calculate_hash_string(bytes: &[u8]) -> String {
    let mut hash_string = String::with_capacity(64);
    for byte in calculate_hash(bytes) {
        write!(hash_string, "{byte:02x}").unwrap();
    }
    hash_string
}

/// Formats a (typically 32 byte) hash as a hex string.
fn format_bytes(bytes: &[u8]) -> String {
    let mut hash_string = String::with_capacity(64);
    for byte in bytes {
        write!(hash_string, "{byte:02x}").unwrap();
    }
    hash_string
}

/// Calculates the SHA256 hash of the given bytes.
fn calculate_hash(bytes: &[u8]) -> [u8; 32] {
    let mut wasm_sha = Sha256::new();
    wasm_sha.write(bytes);
    wasm_sha.finish()
}

// NNS function 34 - UpdateSnsSubnetListRequest
// https://gitlab.com/dfinity-lab/public/ic/-/blob/e5dfd171dc6f2180c1112569766e14dd2c10a090/rs/nns/sns-wasm/canister/sns-wasm.did#L77
pub type UpdateSnsSubnetListRequest = crate::canisters::sns_wasm::api::UpdateSnsSubnetListRequest;

// NNS function 35 - UpdateAllowedPrincipals
// https://github.com/dfinity/ic/blob/8d135c4eec4645837962797b7bdac930085c0dbb/rs/nns/sns-wasm/gen/ic_sns_wasm.pb.v1.rs#L255
pub type UpdateAllowedPrincipalsRequest = crate::canisters::sns_wasm::api::UpdateAllowedPrincipalsRequest;

// NNS function 37 - InsertUpgradePathEntriesRequest
// https://github.com/dfinity/ic/blob/8b674edbb228acfc19923d5c914807166edcd909/rs/nns/sns-wasm/gen/ic_sns_wasm.pb.v1.rs#L128
pub type InsertUpgradePathEntriesRequest = crate::canisters::sns_wasm::api::InsertUpgradePathEntriesRequest;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct SnsVersionHumanReadable {
    pub root_wasm_hash: String,
    pub governance_wasm_hash: String,
    pub ledger_wasm_hash: String,
    pub swap_wasm_hash: String,
    pub archive_wasm_hash: String,
    pub index_wasm_hash: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct SnsUpgradeHumanReadable {
    pub current_version: Option<SnsVersionHumanReadable>,
    pub next_version: Option<SnsVersionHumanReadable>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct InsertUpgradePathEntriesRequestHumanReadable {
    pub upgrade_path: Vec<SnsUpgradeHumanReadable>,
    pub sns_governance_canister_id: Option<Principal>,
}

impl From<SnsVersion> for SnsVersionHumanReadable {
    fn from(payload: SnsVersion) -> Self {
        SnsVersionHumanReadable {
            root_wasm_hash: format_bytes(&payload.root_wasm_hash),
            governance_wasm_hash: format_bytes(&payload.governance_wasm_hash),
            ledger_wasm_hash: format_bytes(&payload.ledger_wasm_hash),
            swap_wasm_hash: format_bytes(&payload.swap_wasm_hash),
            archive_wasm_hash: format_bytes(&payload.archive_wasm_hash),
            index_wasm_hash: format_bytes(&payload.index_wasm_hash),
        }
    }
}

impl From<SnsUpgrade> for SnsUpgradeHumanReadable {
    fn from(payload: SnsUpgrade) -> Self {
        SnsUpgradeHumanReadable {
            current_version: payload.current_version.map(Into::into),
            next_version: payload.next_version.map(Into::into),
        }
    }
}

impl From<InsertUpgradePathEntriesRequest> for InsertUpgradePathEntriesRequestHumanReadable {
    fn from(payload: InsertUpgradePathEntriesRequest) -> Self {
        InsertUpgradePathEntriesRequestHumanReadable {
            upgrade_path: payload.upgrade_path.into_iter().map(Into::into).collect(),
            sns_governance_canister_id: payload.sns_governance_canister_id,
        }
    }
}

// NNS function 38 - UpdateElectedReplicaVersions
/// The payload of a proposal to update elected replica versions.
// https://gitlab.com/dfinity-lab/public/ic/-/blob/90d82ff6e51a66306f9ddba820fcad984f4d85a5/rs/registry/canister/src/mutations/do_update_elected_replica_versions.rs#L193
pub type ReviseElectedGuestosVersionsPayload = crate::canisters::nns_registry::api::ReviseElectedGuestosVersionsPayload;

// NNS function 39 - BitcoinSetConfig
// https://github.com/dfinity/ic/blob/ae00aff1373e9f6db375ff7076250a20bbf3eea0/rs/nns/governance/src/governance.rs#L8930
pub type BitcoinSetConfigProposal = crate::canisters::nns_governance::internal::BitcoinSetConfigProposal;

#[derive(CandidType, Serialize, Deserialize)]
pub struct BitcoinSetConfigProposalHumanReadable {
    pub network: crate::canisters::nns_governance::internal::BitcoinNetwork,
    pub set_config_request: ic_btc_interface::SetConfigRequest,
}

impl From<BitcoinSetConfigProposal> for BitcoinSetConfigProposalHumanReadable {
    fn from(proposal: BitcoinSetConfigProposal) -> Self {
        let set_config_request: ic_btc_interface::SetConfigRequest = candid::decode_one(&proposal.payload).unwrap();
        BitcoinSetConfigProposalHumanReadable {
            network: proposal.network,
            set_config_request,
        }
    }
}

// NNS function 40 - UpdateElectedHostosVersions
// https://github.com/dfinity/ic/blob/26098e18ddd64ab50d3f3725f50c7f369cd3f90e/rs/registry/canister/src/mutations/do_update_elected_hostos_versions.rs#L88
pub type UpdateElectedHostosVersionsPayload = crate::canisters::nns_registry::api::UpdateElectedHostosVersionsPayload;

// NNS function 41 - UpdateNodesHostosVersion
// https://github.com/dfinity/ic/blob/26098e18ddd64ab50d3f3725f50c7f369cd3f90e/rs/registry/canister/src/mutations/do_update_nodes_hostos_version.rs#L38C12-L38C43
pub type UpdateNodesHostosVersionPayload = crate::canisters::nns_registry::api::UpdateNodesHostosVersionPayload;

// NNS function 43 - AddApiBoundaryNode
// https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_add_api_boundary_node.rs#L14
pub type AddApiBoundaryNodesPayload = crate::canisters::nns_registry::api::AddApiBoundaryNodesPayload;

// NNS function 44 - RemoveApiBoundaryNodes
// https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_remove_api_boundary_nodes.rs#L14
pub type RemoveApiBoundaryNodesPayload = crate::canisters::nns_registry::api::RemoveApiBoundaryNodesPayload;

// NNS function 46 - UpdateApiBoundaryNodesVersion
// https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_update_api_boundary_nodes_version.rs#L14
pub type UpdateApiBoundaryNodesVersionPayload = crate::canisters::nns_registry::api::AddApiBoundaryNodesPayload;

// NNS function 47 - UpdateApiBoundaryNodesVersion
// https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_update_api_boundary_nodes_version.rs#L14
pub type DeployGuestosToSomeApiBoundaryNodesPayload = UpdateApiBoundaryNodesVersionPayload;

// NNS function 48 - DeployGuestosToAllUnassignedNodes
// https://github.com/dfinity/ic/blob/3343a9ec1ea3170dcfd0cc4f4298d5ce09abb036/rs/registry/canister/src/mutations/do_deploy_guestos_to_all_unassigned_nodes.rs#L36
pub type DeployGuestosToAllUnassignedNodesPayload =
    crate::canisters::nns_registry::api::DeployGuestosToAllUnassignedNodesPayload;

// NNS function 49 - UpdateSshReadonlyAccessForAllUnassignedNodes
// https://github.com/dfinity/ic/blob/3343a9ec1ea3170dcfd0cc4f4298d5ce09abb036/rs/registry/canister/src/mutations/do_deploy_guestos_to_all_unassigned_nodes.rs#L36
pub type UpdateSshReadOnlyAccessForAllUnassignedNodesPayload =
    crate::canisters::nns_registry::api::UpdateSshReadOnlyAccessForAllUnassignedNodesPayload;

// NNS function 50 - ReviseElectedHostosVersions
// https://github.com/dfinity/ic/blob/26098e18ddd64ab50d3f3725f50c7f369cd3f90e/rs/registry/canister/src/mutations/do_update_elected_hostos_versions.rs#L88
pub type ReviseElectedHostosVersionsPayload = crate::canisters::nns_registry::api::UpdateElectedHostosVersionsPayload;

// NNS function 51 - DeployHostosToSomeNodes
// https://github.com/dfinity/ic/blob/26098e18ddd64ab50d3f3725f50c7f369cd3f90e/rs/registry/canister/src/mutations/do_update_nodes_hostos_version.rs#L38C12-L38C43
pub type DeployHostosToSomeNodesPayload = crate::canisters::nns_registry::api::UpdateNodesHostosVersionPayload;

// Copied from https://github.com/dfinity/ic/blob/master/rs/nns/governance/src/governance.rs
#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Debug)]
pub struct SubnetRentalRequest {
    pub user: PrincipalId,
    pub rental_condition_id: RentalConditionId,
}

// Copied from https://github.com/dfinity/ic/blob/master/rs/nns/governance/src/governance.rs
#[derive(candid::CandidType, candid::Deserialize, serde::Serialize, Clone, Copy, Debug)]
pub enum RentalConditionId {
    App13CH,
}
