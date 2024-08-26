//! Code to fetch proposals and render them as JSON for human consumption.
use crate::canisters::internet_identity::InternetIdentityInit;
use crate::canisters::nns_governance::api::{Action, ProposalInfo};
use crate::def::{
    AddApiBoundaryNodesPayload, AddFirewallRulesPayload, AddNnsCanisterProposal, AddNnsCanisterProposalTrimmed,
    AddNodeOperatorPayload, AddNodesToSubnetPayload, AddOrRemoveDataCentersProposalPayload, AddWasmRequest,
    AddWasmRequestTrimmed, BitcoinSetConfigProposal, BitcoinSetConfigProposalHumanReadable,
    ChangeNnsCanisterProposal, ChangeNnsCanisterProposalTrimmed, ChangeSubnetMembershipPayload,
    ChangeSubnetTypeAssignmentArgs, CompleteCanisterMigrationPayload, CreateSubnetPayload,
    DeployGuestosToAllSubnetNodesPayload, DeployGuestosToAllUnassignedNodesPayload,
    DeployGuestosToSomeApiBoundaryNodesPayload, DeployHostosToSomeNodesPayload, InsertUpgradePathEntriesRequest,
    InsertUpgradePathEntriesRequestHumanReadable, InstallCodeTrimmed, PrepareCanisterMigrationPayload,
    RecoverSubnetPayload, RemoveApiBoundaryNodesPayload, RemoveFirewallRulesPayload, RemoveNodeOperatorsPayload,
    RemoveNodeOperatorsPayloadHumanReadable, RemoveNodesFromSubnetPayload, RemoveNodesPayload,
    RerouteCanisterRangesPayload, ReviseElectedGuestosVersionsPayload,
    ReviseElectedHostosVersionsPayload, SetAuthorizedSubnetworkListArgs, SetFirewallConfigPayload,
    StopOrStartNnsCanisterProposal, SubnetRentalRequest, UpdateAllowedPrincipalsRequest,
    UpdateApiBoundaryNodesVersionPayload, UpdateElectedHostosVersionsPayload, UpdateFirewallRulesPayload,
    UpdateIcpXdrConversionRatePayload, UpdateNodeOperatorConfigPayload, UpdateNodeRewardsTableProposalPayload,
    UpdateNodesHostosVersionPayload, UpdateSnsSubnetListRequest, UpdateSshReadOnlyAccessForAllUnassignedNodesPayload,
    UpdateSubnetPayload, UpdateSubnetTypeArgs, UpdateUnassignedNodesConfigPayload, UpgradeRootProposalPayload,
    UpgradeRootProposalPayloadTrimmed,
};
use candid::types::{self as candid_types, Type, TypeInner};
use candid::{CandidType, IDLArgs};
use candid_parser::types::{self as parser_types, IDLType, IDLTypes};
use ic_base_types::CanisterId;
use ic_nns_constants::{GOVERNANCE_CANISTER_ID, IDENTITY_CANISTER_ID};
use idl2json::candid_types::internal_candid_type_to_idl_type;
use idl2json::{idl_args2json_with_weak_names, BytesFormat, Idl2JsonOptions};
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::json;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::fmt::Debug;

pub mod canisters;
pub mod def;

/// A JSON string.
pub type Json = String;

/// The maximum number of proposal payloads that will be cached.
const CACHE_SIZE_LIMIT: usize = 100;
/// The maximum length of a proposal payload JSON that will be admitted to the cache.
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
                CACHED_PROPOSAL_PAYLOADS.with(|c| insert_into_cache(&mut c.borrow_mut(), proposal_id, json.clone()));
                Ok(json)
            }
            Ok(None) => Err("Proposal not found".to_string()), // We shouldn't cache this as the proposal may simply not exist yet
            Err(error) => Err(error.1), // We shouldn't cache this as the error may just be transient
        }
    }
}

/// Inserts a proposal payload expressed as JSON into the cache, evicting the entry for the oldest proposal if necessary.
fn insert_into_cache(cache: &mut BTreeMap<u64, Json>, proposal_id: u64, payload_json: String) {
    if cache.len() >= CACHE_SIZE_LIMIT {
        // This should correspond to the proposal with the lowest index, hence the oldest entry.
        cache.pop_first();
    }

    cache.insert(proposal_id, payload_json);
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
    let action = proposal_info.proposal.as_ref().and_then(|p| p.action.as_ref());
    match action {
        Some(Action::ExecuteNnsFunction(f)) => {
            transform_payload_to_json(f.nns_function, &f.payload).unwrap_or_else(|e| {
                let error_msg = "Unable to deserialize payload";
                serde_json::to_string(&format!("{error_msg}: {e:.400}")).unwrap_or_else(|_| format!("\"{error_msg}\""))
            })
        }
        Some(Action::InstallCode(install_code)) => {
            let trimmed = InstallCodeTrimmed::from(install_code);
            json!(trimmed).to_string()
        }
        _ => serde_json::to_string("Proposal has no payload")
            .unwrap_or_else(|err| unreachable!("Surely a fixed string can be serialized as JSON?  Err: {err:?}")),
    }
}

/// Options for how to serialize Candid to JSON.
///
/// Note: The priority here is human readable JSON for proposal verification.
const IDL2JSON_OPTIONS: Idl2JsonOptions = Idl2JsonOptions {
    compact: false,
    // Express byte arrays as hex, not as arrays of integers.
    bytes_as: Some(BytesFormat::Hex),
    // Truncate long byte arrays but provide a SHA256 hash of the full value, so that the payload can be verified.
    long_bytes_as: Some((256, BytesFormat::Sha256)),
    // These are the type definitions used in proposal payloads.  If we have them, it would be nice to use them.  Do we?
    prog: Vec::new(),
};

/// Converts a Candid `Type` to a candid `IDLType`. `idl2json` uses `IDLType`.
///
/// Notes:
/// - `IDLType` does not exist in Candid `v10`.  This conversion may well not be needed in the future.
///
/// # Errors
/// - Does not support: `Type::Empty`, `Type::Knot(_)`, `Type::Unknown`
// Type is Rc<TypeInner> and Rc is designed to be passed by value.
fn type_2_idltype(ty: &Type) -> Result<IDLType, String> {
    match (**ty).clone() {
        TypeInner::Null => Ok(IDLType::PrimT(parser_types::PrimType::Null)),
        TypeInner::Bool => Ok(IDLType::PrimT(parser_types::PrimType::Bool)),
        TypeInner::Nat => Ok(IDLType::PrimT(parser_types::PrimType::Nat)),
        TypeInner::Int => Ok(IDLType::PrimT(parser_types::PrimType::Int)),
        TypeInner::Nat8 => Ok(IDLType::PrimT(parser_types::PrimType::Nat8)),
        TypeInner::Nat16 => Ok(IDLType::PrimT(parser_types::PrimType::Nat16)),
        TypeInner::Nat32 => Ok(IDLType::PrimT(parser_types::PrimType::Nat32)),
        TypeInner::Nat64 => Ok(IDLType::PrimT(parser_types::PrimType::Nat64)),
        TypeInner::Int8 => Ok(IDLType::PrimT(parser_types::PrimType::Int8)),
        TypeInner::Int16 => Ok(IDLType::PrimT(parser_types::PrimType::Int16)),
        TypeInner::Int32 => Ok(IDLType::PrimT(parser_types::PrimType::Int32)),
        TypeInner::Int64 => Ok(IDLType::PrimT(parser_types::PrimType::Int64)),
        TypeInner::Float32 => Ok(IDLType::PrimT(parser_types::PrimType::Float32)),
        TypeInner::Float64 => Ok(IDLType::PrimT(parser_types::PrimType::Float64)),
        TypeInner::Text => Ok(IDLType::PrimT(parser_types::PrimType::Text)),
        TypeInner::Reserved => Ok(IDLType::PrimT(parser_types::PrimType::Reserved)),
        TypeInner::Opt(ty) => Ok(IDLType::OptT(Box::new(type_2_idltype(&ty)?))),
        TypeInner::Vec(ty) => Ok(IDLType::VecT(Box::new(type_2_idltype(&ty)?))),
        TypeInner::Record(fields) => {
            let mut idl_fields = Vec::with_capacity(fields.len());
            for field in fields {
                idl_fields.push(parser_types::TypeField {
                    label: (*field.id).clone(),
                    typ: type_2_idltype(&field.ty)?,
                });
            }
            Ok(IDLType::RecordT(idl_fields))
        }
        TypeInner::Variant(variants) => {
            let mut idl_variants = Vec::with_capacity(variants.len());
            for variant in variants {
                idl_variants.push(parser_types::TypeField {
                    label: (*variant.id).clone(),
                    typ: type_2_idltype(&variant.ty)?,
                });
            }
            Ok(IDLType::VariantT(idl_variants))
        }
        TypeInner::Principal => Ok(IDLType::PrincipalT),
        TypeInner::Var(name) => Ok(IDLType::VarT(name)),
        TypeInner::Func(candid_types::Function { modes, args, rets }) => Ok(IDLType::FuncT(parser_types::FuncType {
            modes,
            args: args.iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
            rets: rets.iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
        })),
        TypeInner::Class(yin, yang) => Ok(IDLType::ClassT(
            yin.iter().map(type_2_idltype).collect::<Result<Vec<_>, _>>()?,
            Box::new(type_2_idltype(&yang)?),
        )),
        TypeInner::Service(bindings) => Ok(IDLType::ServT(
            bindings
                .into_iter()
                .map(|(id, typ)| type_2_idltype(&typ).map(|typ| parser_types::Binding { id, typ }))
                .collect::<Result<Vec<_>, _>>()?,
        )),
        TypeInner::Empty | TypeInner::Knot(_) | TypeInner::Unknown | TypeInner::Future => {
            Err(format!("Unsupported type: {ty:.30}"))
        }
    }
}

/// Converts an NNS function payload, in candid, to JSON.
fn transform_payload_to_json(nns_function: i32, payload_bytes: &[u8]) -> Result<String, String> {
    /// Converts a type to JSON without using type information.
    ///
    /// # Errors
    /// - Failed to parse the Candid.
    /// - Failed to serialize the Candid into JSON.
    ///
    /// TODO: Check  whether the JSON is too large.
    fn candid_fallback<In>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType,
    {
        let candid_type = IDLTypes {
            args: vec![type_2_idltype(&In::ty())?],
        };
        let payload_idl = IDLArgs::from_bytes(payload_bytes).map_err(debug)?;
        let json_value = idl_args2json_with_weak_names(&payload_idl, &candid_type, &IDL2JSON_OPTIONS);
        serde_json::to_string(&json_value).map_err(|_| "Failed to serialize JSON".to_string())
    }

    /// Converts a type to JSON with type information:
    /// - Parses Candid data into the `In` type.
    /// - Transforms the `In` type into the `Out` type; Please ensure that `Into<Out>` is implemented for `In`.
    /// - Serializes the `Out` type into JSON.
    ///
    /// # Errors
    /// - Failed to parse the Candid as type `In`.
    /// - Failed to serialize the `Out` type into JSON.
    /// - The JSON is too large.
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

    /// Converts a Candid message to JSON:
    /// - Tries to convert using the provided types.
    /// - If that fails, try to convert without type information.
    ///
    /// # Errors
    /// - Even the fallback failed to convert the Candid message to JSON.  Please see `candid_fallback` for possible reasons for this.
    fn transform<In, Out>(payload_bytes: &[u8]) -> Result<String, String>
    where
        In: CandidType + DeserializeOwned + Into<Out>,
        Out: Serialize,
    {
        try_transform::<In, Out>(payload_bytes).or_else(|_| candid_fallback::<In>(payload_bytes))
    }

    /// Converts a Candid message to JSON using the given type.
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
        6 => identity::<RecoverSubnetPayload>(payload_bytes),
        7 => identity::<UpdateSubnetPayload>(payload_bytes),
        8 => identity::<AddNodeOperatorPayload>(payload_bytes),
        9 => transform::<UpgradeRootProposalPayload, UpgradeRootProposalPayloadTrimmed>(payload_bytes),
        10 => identity::<UpdateIcpXdrConversionRatePayload>(payload_bytes),
        11 => identity::<DeployGuestosToAllSubnetNodesPayload>(payload_bytes),
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
        37 => transform::<InsertUpgradePathEntriesRequest, InsertUpgradePathEntriesRequestHumanReadable>(payload_bytes),
        38 => identity::<ReviseElectedGuestosVersionsPayload>(payload_bytes),
        39 => transform::<BitcoinSetConfigProposal, BitcoinSetConfigProposalHumanReadable>(payload_bytes),
        40 => identity::<UpdateElectedHostosVersionsPayload>(payload_bytes),
        41 => identity::<UpdateNodesHostosVersionPayload>(payload_bytes),
        // 42 => HARD RESET
        43 => identity::<AddApiBoundaryNodesPayload>(payload_bytes),
        44 => identity::<RemoveApiBoundaryNodesPayload>(payload_bytes),
        // 45 reserved ("NNS_FUNCTION_UPDATE_API_BOUNDARY_NODE_DOMAIN") - https://github.com/dfinity/ic/blob/cd8ad64ed63e38db0d40386ba226df25767d4cd6/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L616
        46 => identity::<UpdateApiBoundaryNodesVersionPayload>(payload_bytes),
        47 => identity::<DeployGuestosToSomeApiBoundaryNodesPayload>(payload_bytes),
        48 => identity::<DeployGuestosToAllUnassignedNodesPayload>(payload_bytes),
        49 => identity::<UpdateSshReadOnlyAccessForAllUnassignedNodesPayload>(payload_bytes),
        50 => identity::<ReviseElectedHostosVersionsPayload>(payload_bytes),
        51 => identity::<DeployHostosToSomeNodesPayload>(payload_bytes),
        52 => identity::<SubnetRentalRequest>(payload_bytes),
        _ => Err("Unrecognised NNS function".to_string()),
    }
}

/// Stringifies a value to create an error message.
fn debug<T: Debug>(value: T) -> String {
    format!("{value:?}")
}

#[cfg(test)]
mod tests;
