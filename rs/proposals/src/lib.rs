use crate::canisters::nns_governance::api::{Action, ProposalInfo};
use crate::def::*;
use candid::parser::types::{self as parser_types, IDLType, IDLTypes};
use candid::types::{self as candid_types, Type};
use candid::{CandidType, Deserialize, IDLArgs};
use ic_base_types::CanisterId;
use ic_nns_constants::{GOVERNANCE_CANISTER_ID, IDENTITY_CANISTER_ID};
use idl2json::candid_types::internal_candid_type_to_idl_type;
use idl2json::{idl_args2json_with_weak_names, BytesFormat, Idl2JsonOptions};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::fmt::Debug;
use std::ops::DerefMut;

pub mod canisters;

type Json = String;

const CACHE_SIZE_LIMIT: usize = 100;
const CACHE_ITEM_SIZE_LIMIT: usize = 2 * 1024 * 1024; // 2MB

thread_local! {
    // These are purposely not stored in stable memory.
    static CACHED_PROPOSAL_PAYLOADS: RefCell<BTreeMap<u64, Json>> = RefCell::default();
}

/// Gets a proposal payload from cache, if available, else from the governance canister (and populates the cache).
///
/// # Errors
/// - If the requested `proposal_id` does not exist in, or could not be retrieved from, the governance canister.
pub async fn get_proposal_payload(proposal_id: u64) -> Result<Json, String> {
    if let Some(result) = CACHED_PROPOSAL_PAYLOADS.with(|c| c.borrow().get(&proposal_id).cloned()) {
        Ok(result)
    } else {
        match crate::canisters::nns_governance::api::Service(GOVERNANCE_CANISTER_ID.into())
            .get_proposal_info(proposal_id)
            .await
            .map(|result| result.0)
        {
            Ok(Some(proposal_info)) => {
                let json = process_proposal_payload(&proposal_info);
                CACHED_PROPOSAL_PAYLOADS
                    .with(|c| insert_into_cache(c.borrow_mut().deref_mut(), proposal_id, json.clone()));
                Ok(json)
            }
            Ok(None) => Err("Proposal not found".to_string()), // We shouldn't cache this as the proposal may simply not exist yet
            Err(error) => Err(error.1), // We shouldn't cache this as the error may just be transient
        }
    }
}

fn insert_into_cache(cache: &mut BTreeMap<u64, Json>, proposal_id: u64, payload_json: String) {
    if cache.len() >= CACHE_SIZE_LIMIT {
        cache.pop_first();
    }

    cache.insert(proposal_id, payload_json);
}

/// Types used to decode argument payload of NNS function type 4 for II upgrades
/// Source: https://github.com/dfinity/internet-identity/blob/main/src/internet_identity_interface/src/lib.rs#L174
pub type AnchorNumber = u64;
#[derive(CandidType, Serialize, Deserialize)]
pub struct InternetIdentityInit {
    pub assigned_user_number_range: Option<(AnchorNumber, AnchorNumber)>,
    pub archive_config: Option<ArchiveConfig>,
    pub canister_creation_cycles_cost: Option<u64>,
    pub register_rate_limit: Option<RateLimitConfig>,
    pub max_num_latest_delegation_origins: Option<u64>,
    pub migrate_storage_to_memory_manager: Option<bool>,
}
#[derive(CandidType, Serialize, Deserialize)]
pub struct RateLimitConfig {
    /// Time it takes for a rate limiting token to be replenished.
    pub time_per_token_ns: u64,
    /// How many tokens are at most generated (to accommodate peaks).
    pub max_tokens: u64,
}
/// Configuration parameters of the archive to be used on the next deployment.
#[derive(CandidType, Serialize, Deserialize)]
pub struct ArchiveConfig {
    /// Wasm module hash that is allowed to be deployed to the archive canister.
    pub module_hash: [u8; 32],
    /// Buffered archive entries limit. If reached, II will stop accepting new anchor operations
    /// until the buffered operations are acknowledged by the archive.
    pub entries_buffer_limit: u64,
    /// Polling interval at which the archive should fetch buffered archive entries from II (in nanoseconds).
    pub polling_interval_ns: u64,
    /// Max number of archive entries to be fetched in a single call.
    pub entries_fetch_limit: u16,
    /// How the entries get transferred to the archive.
    /// This is opt, so that the configuration parameter can be removed after switching from push to pull.
    /// Defaults to Push (legacy mode).
    pub archive_integration: Option<ArchiveIntegration>,
}

#[derive(CandidType, Serialize, Deserialize)]
pub enum ArchiveIntegration {
    #[serde(rename = "push")]
    Push,
    #[serde(rename = "pull")]
    Pull,
}

/// Best effort to determine the types of a canister arguments.
fn canister_arg_types(canister_id: Option<CanisterId>) -> IDLTypes {
    // If canister id is II
    // use InternetIdentityInit type
    let args = if canister_id == Some(IDENTITY_CANISTER_ID) {
        let idl_type = internal_candid_type_to_idl_type(&InternetIdentityInit::ty());
        vec![IDLType::OptT(Box::new(idl_type))]
    } else {
        vec![]
    };
    IDLTypes { args }
}

/// Converts the argument to JSON.
fn decode_arg(arg: &[u8], arg_types: &IDLTypes) -> String {
    // TODO: Test empty payload
    // TODO: Test existing payloads
    // TODO: Test muti-value payloads
    match IDLArgs::from_bytes(arg) {
        Ok(idl_args) => {
            let json_value = idl_args2json_with_weak_names(&idl_args, arg_types, &IDL2JSON_OPTIONS);
            serde_json::to_string(&json_value).expect("Failed to serialize JSON")
        }
        Err(_) => "[]".to_owned(),
    }
}

/// Checks if the proposal has a payload.  If yes, de-serializes it then converts it to JSON.
#[must_use]
pub fn process_proposal_payload(proposal_info: &ProposalInfo) -> Json {
    if let Some(Action::ExecuteNnsFunction(f)) = proposal_info.proposal.as_ref().and_then(|p| p.action.as_ref()) {
        transform_payload_to_json(f.nns_function, &f.payload).unwrap_or_else(|e| {
            let error_msg = "Unable to deserialize payload";
            serde_json::to_string(&format!("{error_msg}: {e:.400}")).unwrap_or_else(|_| format!("\"{error_msg}\""))
        })
    } else {
        #[allow(clippy::unwrap_used)]
        serde_json::to_string("Proposal has no payload").unwrap()
    }
}

const IDL2JSON_OPTIONS: Idl2JsonOptions = Idl2JsonOptions {
    bytes_as: Some(BytesFormat::Hex),
    long_bytes_as: Some((256, BytesFormat::Sha256)),
    prog: Vec::new(), // These are the type definitions used in proposal payloads.  If we have them, it would be nice to use them.  Do we?
};

/// Converts a Candid `Type` to a candid `IDLType`. `idl2json` uses `IDLType`.
///
/// Notes:
/// - `IDLType` does not exist in Candid `v10`.  This conversion may well not be needed in the future.
///
/// # Errors
/// - Does not support: `Type::Empty`, `Type::Knot(_)`, `Type::Unknown`
fn type_2_idltype(ty: Type) -> Result<IDLType, String> {
    match ty {
        Type::Null => Ok(IDLType::PrimT(parser_types::PrimType::Null)),
        Type::Bool => Ok(IDLType::PrimT(parser_types::PrimType::Bool)),
        Type::Nat => Ok(IDLType::PrimT(parser_types::PrimType::Nat)),
        Type::Int => Ok(IDLType::PrimT(parser_types::PrimType::Int)),
        Type::Nat8 => Ok(IDLType::PrimT(parser_types::PrimType::Nat8)),
        Type::Nat16 => Ok(IDLType::PrimT(parser_types::PrimType::Nat16)),
        Type::Nat32 => Ok(IDLType::PrimT(parser_types::PrimType::Nat32)),
        Type::Nat64 => Ok(IDLType::PrimT(parser_types::PrimType::Nat64)),
        Type::Int8 => Ok(IDLType::PrimT(parser_types::PrimType::Int8)),
        Type::Int16 => Ok(IDLType::PrimT(parser_types::PrimType::Int16)),
        Type::Int32 => Ok(IDLType::PrimT(parser_types::PrimType::Int32)),
        Type::Int64 => Ok(IDLType::PrimT(parser_types::PrimType::Int64)),
        Type::Float32 => Ok(IDLType::PrimT(parser_types::PrimType::Float32)),
        Type::Float64 => Ok(IDLType::PrimT(parser_types::PrimType::Float64)),
        Type::Text => Ok(IDLType::PrimT(parser_types::PrimType::Text)),
        Type::Reserved => Ok(IDLType::PrimT(parser_types::PrimType::Reserved)),
        Type::Opt(ty) => Ok(IDLType::OptT(Box::new(type_2_idltype(*ty)?))),
        Type::Vec(ty) => Ok(IDLType::VecT(Box::new(type_2_idltype(*ty)?))),
        Type::Record(fields) => {
            let mut idl_fields = Vec::with_capacity(fields.len());
            for field in fields {
                idl_fields.push(parser_types::TypeField {
                    label: field.id,
                    typ: type_2_idltype(field.ty)?,
                });
            }
            Ok(IDLType::RecordT(idl_fields))
        }
        Type::Variant(variants) => {
            let mut idl_variants = Vec::with_capacity(variants.len());
            for variant in variants {
                idl_variants.push(parser_types::TypeField {
                    label: variant.id,
                    typ: type_2_idltype(variant.ty)?,
                });
            }
            Ok(IDLType::VariantT(idl_variants))
        }
        Type::Principal => Ok(IDLType::PrincipalT),
        Type::Var(name) => Ok(IDLType::VarT(name)),
        Type::Func(candid_types::Function { modes, args, rets }) => Ok(IDLType::FuncT(parser_types::FuncType {
            modes,
            args: args.into_iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
            rets: rets.into_iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
        })),
        Type::Class(yin, yang) => Ok(IDLType::ClassT(
            yin.into_iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
            Box::new(type_2_idltype(*yang)?),
        )),
        Type::Service(bindings) => Ok(IDLType::ServT(
            bindings
                .into_iter()
                .map(|(id, typ)| type_2_idltype(typ).map(|typ| parser_types::Binding { id, typ }))
                .collect::<Result<Vec<_>, _>>()?,
        )),
        Type::Empty | Type::Knot(_) | Type::Unknown => Err(format!("Unsupported type: {ty:.30}")),
    }
}

fn transform_payload_to_json(nns_function: i32, payload_bytes: &[u8]) -> Result<String, String> {
    fn candid_fallback<In>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType,
    {
        let candid_type = IDLTypes {
            args: vec![type_2_idltype(In::ty())?],
        };
        let payload_idl = IDLArgs::from_bytes(payload_bytes).map_err(debug)?;
        let json_value = idl_args2json_with_weak_names(&payload_idl, &candid_type, &IDL2JSON_OPTIONS);
        serde_json::to_string(&json_value).map_err(|_| "Failed to serialize JSON".to_string())
    }

    fn try_transform<In, Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType + DeserializeOwned + Into<Out>,
        Out: Serialize,
    {
        let payload: In = candid::decode_one(payload_bytes).map_err(debug)?;
        let payload_transformed: Out = payload.into();
        let json = serde_json::to_string(&payload_transformed).map_err(debug)?;
        if json.len() <= CACHE_ITEM_SIZE_LIMIT {
            Ok(json)
        } else {
            Err("Payload too large".to_string())
        }
    }
    fn transform<In, Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType + DeserializeOwned + Into<Out>,
        Out: Serialize,
    {
        try_transform::<In, Out>(payload_bytes).or_else(|_| candid_fallback::<In>(payload_bytes))
    }
    fn identity<Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        Out: CandidType + Serialize + DeserializeOwned,
    {
        transform::<Out, Out>(payload_bytes)
    }

    // See full list here - https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/governance/gen/ic_nns_governance.pb.v1.rs#L1690
    // transform: deserialize -> transform -> serialize to JSON
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
        24 => identity::<RerouteCanisterRangesPayload>(payload_bytes),
        25 => identity::<AddFirewallRulesPayload>(payload_bytes),
        26 => identity::<RemoveFirewallRulesPayload>(payload_bytes),
        27 => identity::<UpdateFirewallRulesPayload>(payload_bytes),
        28 => identity::<PrepareCanisterMigrationPayload>(payload_bytes),
        29 => identity::<CompleteCanisterMigrationPayload>(payload_bytes),
        30 => transform::<AddWasmRequest, AddWasmRequestTrimmed>(payload_bytes),
        31 => identity::<ChangeSubnetMembershipPayload>(payload_bytes),
        32 => identity::<UpdateSubnetTypeArgs>(payload_bytes),
        33 => identity::<ChangeSubnetTypeAssignmentArgs>(payload_bytes),
        34 => identity::<UpdateSnsSubnetListRequest>(payload_bytes),
        35 => identity::<UpdateAllowedPrincipalsRequest>(payload_bytes),
        36 => identity::<RetireReplicaVersionPayload>(payload_bytes),
        37 => transform::<InsertUpgradePathEntriesRequest, InsertUpgradePathEntriesRequestHumanReadable>(payload_bytes),
        38 => identity::<UpdateElectedReplicaVersionsPayload>(payload_bytes),
        39 => transform::<BitcoinSetConfigProposal, BitcoinSetConfigProposalHumanReadable>(payload_bytes),
        40 => identity::<UpdateElectedHostosVersionsPayload>(payload_bytes),
        41 => identity::<UpdateNodesHostosVersionPayload>(payload_bytes),
        // 42 => HARD RESET
        43 => identity::<AddApiBoundaryNodePayload>(payload_bytes),
        44 => identity::<RemoveApiBoundaryNodesPayload>(payload_bytes),
        // 45 reserved ("NNS_FUNCTION_UPDATE_API_BOUNDARY_NODE_DOMAIN") - https://github.com/dfinity/ic/blob/cd8ad64ed63e38db0d40386ba226df25767d4cd6/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L616
        46 => identity::<UpdateApiBoundaryNodesVersionPayload>(payload_bytes),
        _ => Err("Unrecognised NNS function".to_string()),
    }
}

fn debug<T: Debug>(value: T) -> String {
    format!("{value:?}")
}

mod def {
    use crate::canister_arg_types;
    use crate::canisters::sns_wasm::api::{SnsUpgrade, SnsVersion};
    use crate::{decode_arg, Json};
    use candid::{CandidType, Principal};
    use ic_base_types::{CanisterId, PrincipalId};
    use ic_crypto_sha2::Sha256;
    use ic_ic00_types::CanisterInstallMode;
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

    // NNS function 5 - BlessReplicaVersion
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_bless_replica_version.rs#L83
    pub type BlessReplicaVersionPayload = crate::canisters::nns_registry::api::BlessReplicaVersionPayload;

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

    // NNS function 11 - UpdateSubnetReplicaVersion
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_subnet_replica.rs#L58
    pub type UpdateSubnetReplicaVersionPayload = crate::canisters::nns_registry::api::UpdateSubnetReplicaVersionPayload;

    // NNS function 13 - RemoveNodesFromSubnet
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_remove_nodes_from_subnet.rs#L57
    pub type RemoveNodesFromSubnetPayload = crate::canisters::nns_registry::internal::RemoveNodesFromSubnetPayload;

    // NNS function 14 - SetAuthorizedSubnetworkList
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nns/cmc/src/lib.rs#L168
    pub type SetAuthorizedSubnetworkListArgs = cycles_minting_canister::SetAuthorizedSubnetworkListArgs;

    // NNS function 15 - SetFirewallConfig
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_set_firewall_config.rs#L39
    pub type SetFirewallConfigPayload = crate::canisters::nns_registry::api::SetFirewallConfigPayload;

    // NNS function 16 - UpdateNodeOperatorConfig
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_node_operator_config.rs#L106
    pub type UpdateNodeOperatorConfigPayload = crate::canisters::nns_registry::api::UpdateNodeOperatorConfigPayload;

    // NNS function 17 - StopOrStartNNSCanister
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/nervous_system/root/src/lib.rs#L258
    pub type StopOrStartNnsCanisterProposal = ic_nervous_system_root::change_canister::StopOrStartCanisterProposal;

    // NNS function 18 - RemoveNodes
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/node_management/do_remove_nodes.rs#L96
    pub type RemoveNodesPayload = crate::canisters::nns_registry::api::RemoveNodesPayload;

    // NNS function 20 - UpdateNodeRewardsTable
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/node_rewards/v2/node_rewards.proto#L24
    pub type UpdateNodeRewardsTableProposalPayload =
        ic_protobuf::registry::node_rewards::v2::UpdateNodeRewardsTableProposalPayload;

    // NNS function 21 - AddOrRemoveDataCenters
    // https://github.com/dfinity/ic/blob/5b2647754d0c2200b645d08a6ddce32251438ed5/rs/protobuf/def/registry/dc/v1/dc.proto#L23
    pub type AddOrRemoveDataCentersProposalPayload =
        ic_protobuf::registry::dc::v1::AddOrRemoveDataCentersProposalPayload;

    // NNS function 22 - UpdateUnassignedNodes
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/do_update_unassigned_nodes_config.rs#L62
    pub type UpdateUnassignedNodesConfigPayload =
        crate::canisters::nns_registry::api::UpdateUnassignedNodesConfigPayload;

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
    // https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/reroute_canister_ranges.rs#L66
    pub type RerouteCanisterRangesPayload = crate::canisters::nns_registry::api::RerouteCanisterRangesPayload;

    // NNS function 25 - AddFirewallRules
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L218
    pub type AddFirewallRulesPayload = crate::canisters::nns_registry::api::AddFirewallRulesPayload;

    // NNS function 26 - RemoveFirewallRules
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L233
    pub type RemoveFirewallRulesPayload = crate::canisters::nns_registry::api::RemoveFirewallRulesPayload;

    // NNS function 27 - UpdateFirewallRules
    // https://github.com/dfinity/ic/blob/0a729806f2fbc717f2183b07efac19f24f32e717/rs/registry/canister/src/mutations/firewall.rs#L246
    pub type UpdateFirewallRulesPayload = crate::canisters::nns_registry::internal::UpdateFirewallRulesPayload;

    // NNS function 28 - PrepareCanisterMigration
    // https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/prepare_canister_migration.rs#L67
    pub type PrepareCanisterMigrationPayload = crate::canisters::nns_registry::api::PrepareCanisterMigrationPayload;

    // NNS function 29 - CompleteCanisterMigration
    // https://github.com/dfinity/ic/blob/5a1b0fe380dda87e7a3fcc62d48d646a91d2f12c/rs/registry/canister/src/mutations/complete_canister_migration.rs#L34
    pub type CompleteCanisterMigrationPayload = crate::canisters::nns_registry::api::CompleteCanisterMigrationPayload;

    // NNS function 30 - AddSnsWasm
    // https://github.com/dfinity/ic/blob/187e933e73867efc3993572abc6344b8cedfafe5/rs/nns/sns-wasm/gen/ic_sns_wasm.pb.v1.rs#L62
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

    // NNS function 31 - ChangeSubnetMembership
    // The payload of a proposal to change the membership of nodes in an existing subnet.
    // https://github.com/dfinity/ic/blob/f74c23fe475aa9545f936748e2506f609aa4be8d/rs/registry/canister/src/mutations/do_change_subnet_membership.rs#L71
    pub type ChangeSubnetMembershipPayload = crate::canisters::nns_registry::api::ChangeSubnetMembershipPayload;

    // NNS function 32 - UpdateSubnetType
    // Updates the available subnet types in the cycles minting canister.
    // https://github.com/dfinity/ic/blob/2ff38b1c305302e96aa85c7aa1f1e3811aa84819/rs/nns/cmc/src/lib.rs#L179
    pub type UpdateSubnetTypeArgs = cycles_minting_canister::UpdateSubnetTypeArgs;

    // NNS function 33 - ChangeSubnetTypeAssignment
    // Changes the assignment of subnets to subnet types in the cycles minting canister.
    // https://github.com/dfinity/ic/blob/503fb9ad621f7ab979b3c874365170c37fe444ba/rs/nns/cmc/src/lib.rs#L227
    pub type ChangeSubnetTypeAssignmentArgs = cycles_minting_canister::ChangeSubnetTypeAssignmentArgs;

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
            write!(hash_string, "{byte:02x}").unwrap();
        }
        hash_string
    }

    fn format_bytes(bytes: &[u8]) -> String {
        let mut hash_string = String::with_capacity(64);
        for byte in bytes {
            write!(hash_string, "{byte:02x}").unwrap();
        }
        hash_string
    }

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

    // NNS function 36 - RetireReplicaVersion
    // https://github.com/dfinity/ic/blob/c2ad499466967a9a5557d737c2b9c0b9fa8ad53f/rs/registry/canister/src/mutations/do_retire_replica_version.rs#L143
    pub type RetireReplicaVersionPayload = crate::canisters::nns_registry::api::RetireReplicaVersionPayload;

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
    pub type UpdateElectedReplicaVersionsPayload =
        crate::canisters::nns_registry::api::UpdateElectedReplicaVersionsPayload;

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
    pub type UpdateElectedHostosVersionsPayload =
        crate::canisters::nns_registry::api::UpdateElectedHostosVersionsPayload;

    // NNS function 41 - UpdateNodesHostosVersion
    // https://github.com/dfinity/ic/blob/26098e18ddd64ab50d3f3725f50c7f369cd3f90e/rs/registry/canister/src/mutations/do_update_nodes_hostos_version.rs#L38C12-L38C43
    pub type UpdateNodesHostosVersionPayload = crate::canisters::nns_registry::api::UpdateNodesHostosVersionPayload;

    // NNS function 43 - AddApiBoundaryNode
    // https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_add_api_boundary_node.rs#L14
    pub type AddApiBoundaryNodePayload = crate::canisters::nns_registry::api::AddApiBoundaryNodePayload;

    // NNS function 44 - RemoveApiBoundaryNodes
    // https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_remove_api_boundary_nodes.rs#L14
    pub type RemoveApiBoundaryNodesPayload = crate::canisters::nns_registry::api::RemoveApiBoundaryNodesPayload;

    // NNS function 46 - UpdateApiBoundaryNodesVersion
    // https://github.com/dfinity/ic/blob/04c9c04c7a1f52ab5529531691a7c1bcf289c30d/rs/registry/canister/src/mutations/do_update_api_boundary_nodes_version.rs#L14
    pub type UpdateApiBoundaryNodesVersionPayload =
        crate::canisters::nns_registry::api::UpdateApiBoundaryNodesVersionPayload;
}

#[cfg(test)]
mod tests;
