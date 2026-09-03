//! Tests for the size limits on SNS controlled data.
#![allow(clippy::panic)]
#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use super::{bound, bound_upstream_data, fill_unreadable_nulls, limits, strip_unserved_swap_state};
use crate::types::ic_sns_governance::{GetMetadataResponse, NervousSystemParameters, NeuronPermissionList};
use crate::types::ic_sns_swap::{
    BuyerState, CfParticipant, DerivedState, GetDerivedStateResponse, GetInitResponse, GetSaleParametersResponse,
    GetStateResponse, SnsNeuronRecipe, Swap,
};
use crate::types::slow::SlowSnsData;
use crate::types::upstream::UpstreamData;
use crate::Icrc1Value;
use serde_bytes::ByteBuf;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

/// The mainnet snapshot that the launchpad tests use.
///
/// A bot updates these files from mainnet.  They hold the aggregator response for every SNS, in
/// the form that the aggregator serves.
fn mainnet_snapshot_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../frontend/src/tests/workflows/Launchpad")
}

/// Reads every SNS record in the mainnet snapshot.
fn mainnet_sns_records() -> Vec<Value> {
    let dir = mainnet_snapshot_dir();
    let mut records = Vec::new();
    let entries = fs::read_dir(&dir).unwrap_or_else(|err| panic!("Failed to read {}: {err}", dir.display()));
    for entry in entries {
        let path = entry.expect("Failed to read a directory entry").path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }
        let text = fs::read_to_string(&path).unwrap_or_else(|err| panic!("Failed to read {}: {err}", path.display()));
        let page: Value =
            serde_json::from_str(&text).unwrap_or_else(|err| panic!("Failed to parse {}: {err}", path.display()));
        let page = page
            .as_array()
            .unwrap_or_else(|| panic!("{} does not hold an array", path.display()))
            .clone();
        records.extend(page);
    }
    assert!(
        records.len() > 10,
        "Expected the mainnet snapshot to hold many SNSs, found {}",
        records.len()
    );
    records
}

/// A buyer record, as the swap canister returns it.
fn a_buyer() -> (String, BuyerState) {
    (
        "a buyer".to_string(),
        BuyerState {
            icp: None,
            has_created_neuron_recipes: None,
        },
    )
}

/// A neuron recipe, as the swap canister returns it.
fn a_neuron_recipe() -> SnsNeuronRecipe {
    SnsNeuronRecipe {
        sns: None,
        claimed_status: None,
        neuron_attributes: None,
        investor: None,
    }
}

/// A Neurons' Fund participant, as the swap canister returns it.
fn a_cf_participant() -> CfParticipant {
    CfParticipant {
        controller: None,
        hotkey_principal: "a principal".to_string(),
        cf_neurons: Vec::new(),
    }
}

#[test]
fn bound_keeps_a_value_within_the_limit() {
    let value = Some("a".repeat(100));
    let (bounded_value, reason) = bound(value.clone(), limits::META_DESCRIPTION);
    assert_eq!(bounded_value, value);
    assert_eq!(reason, None);
}

#[test]
fn bound_keeps_a_value_of_exactly_the_limit() {
    // Two of the bytes are the JSON quotation marks.
    let value = "a".repeat(limits::META_URL - 2);
    let (bounded_value, reason) = bound(value.clone(), limits::META_URL);
    assert_eq!(bounded_value, value);
    assert_eq!(reason, None);
}

#[test]
fn bound_empties_a_value_over_the_limit() {
    let value = Some("a".repeat(limits::META_DESCRIPTION + 1));
    let (bounded_value, reason) = bound(value, limits::META_DESCRIPTION);
    assert_eq!(bounded_value, None, "An oversized description must be emptied");
    assert!(reason.is_some(), "An oversized description must be reported");
}

#[test]
fn bound_empties_an_oversized_logo() {
    // A data URL for a logo of one megabyte.
    let logo = Some(format!("data:image/png;base64,{}", "A".repeat(1024 * 1024)));
    let (bounded_logo, reason) = bound(logo, limits::META_LOGO);
    assert_eq!(bounded_logo, None);
    assert!(reason.is_some());
}

#[test]
fn bound_empties_an_oversized_list() {
    let entries: Vec<String> = (0..100_000).map(|index| format!("entry {index}")).collect();
    let (bounded_entries, reason) = bound(entries, limits::ICRC1_METADATA);
    assert!(bounded_entries.is_empty(), "An oversized list must be emptied");
    assert!(reason.is_some());
}

#[test]
fn bound_keeps_the_largest_real_ledger_metadata() {
    let largest = mainnet_sns_records()
        .iter()
        .map(|record| record["icrc1_metadata"].to_string().len())
        .max()
        .expect("The snapshot holds no SNS");
    let value = "A".repeat(largest);
    let (bounded_value, reason) = bound(value.clone(), limits::ICRC1_METADATA);
    assert_eq!(bounded_value, value, "The largest real ledger metadata must survive");
    assert_eq!(reason, None);
}

#[test]
fn strip_unserved_swap_state_clears_the_participant_lists() {
    let swap = Swap {
        auto_finalize_swap_response: None,
        neuron_recipes: vec![a_neuron_recipe(), a_neuron_recipe()],
        next_ticket_id: Some(7),
        decentralization_sale_open_timestamp_seconds: Some(1234),
        finalize_swap_in_progress: None,
        timers: None,
        cf_participants: vec![a_cf_participant(), a_cf_participant()],
        init: None,
        already_tried_to_auto_finalize: None,
        neurons_fund_participation_icp_e8s: None,
        purge_old_tickets_last_completion_timestamp_nanoseconds: None,
        direct_participation_icp_e8s: None,
        lifecycle: 2,
        purge_old_tickets_next_principal: None,
        decentralization_swap_termination_timestamp_seconds: None,
        buyers: vec![a_buyer(), a_buyer(), a_buyer()],
        params: None,
        open_sns_token_swap_proposal_id: Some(42),
    };
    let stripped = strip_unserved_swap_state(GetStateResponse {
        swap: Some(swap),
        derived: None,
    });
    let stripped_swap = stripped.swap.expect("The swap must survive");
    assert!(stripped_swap.buyers.is_empty(), "The buyers must be cleared");
    assert!(
        stripped_swap.neuron_recipes.is_empty(),
        "The neuron recipes must be cleared"
    );
    assert!(
        stripped_swap.cf_participants.is_empty(),
        "The Neurons' Fund participants must be cleared"
    );
    assert_eq!(stripped_swap.lifecycle, 2, "The lifecycle must survive");
    assert_eq!(
        stripped_swap.decentralization_sale_open_timestamp_seconds,
        Some(1234),
        "The sale start time must survive"
    );
    assert_eq!(
        stripped_swap.open_sns_token_swap_proposal_id,
        Some(42),
        "The proposal ID must survive"
    );
}

#[test]
fn strip_unserved_swap_state_accepts_an_empty_state() {
    let stripped = strip_unserved_swap_state(GetStateResponse::default());
    assert!(stripped.swap.is_none());
    assert!(stripped.derived.is_none());
}

/// Every SNS on mainnet must stay within the limits.
///
/// A limit that is too low empties a field of a real SNS.  The launchpad then shows that SNS
/// without its data.  If this test fails, mainnet data has grown past a limit.  Raise the limit
/// in `limits`.
///
/// The snapshot holds the data in the form that the aggregator serves.  It therefore holds no
/// governance logo, because the aggregator serves the logo as a separate asset.  Its swap state
/// is also the served subset, which is smaller than the cached swap state.
#[test]
fn mainnet_sns_data_is_within_the_limits() {
    let field_limits: &[(&str, usize)] = &[
        ("list_sns_canisters", limits::LIST_SNS_CANISTERS),
        ("metrics", limits::METRICS),
        ("latest_reward_event", limits::LATEST_REWARD_EVENT),
        ("parameters", limits::PARAMETERS),
        ("nervous_system_parameters", limits::NERVOUS_SYSTEM_PARAMETERS),
        ("swap_state", limits::SWAP_STATE),
        ("icrc1_metadata", limits::ICRC1_METADATA),
        ("icrc1_fee", limits::ICRC1_FEE),
        ("icrc1_total_supply", limits::ICRC1_TOTAL_SUPPLY),
        ("swap_params", limits::SWAP_PARAMS),
        ("init", limits::INIT),
        ("derived_state", limits::DERIVED_STATE),
        ("lifecycle", limits::LIFECYCLE),
        ("topics", limits::TOPICS),
    ];
    let meta_limits: &[(&str, usize)] = &[
        ("url", limits::META_URL),
        ("name", limits::META_NAME),
        ("description", limits::META_DESCRIPTION),
    ];
    for record in mainnet_sns_records() {
        let index = record["index"].clone();
        for &(field, limit) in field_limits {
            let size = record[field].to_string().len();
            assert!(
                size <= limit,
                "SNS index {index}: field '{field}' has {size} bytes and the limit is {limit} bytes"
            );
        }
        for &(field, limit) in meta_limits {
            let size = record["meta"][field].to_string().len();
            assert!(
                size <= limit,
                "SNS index {index}: field 'meta.{field}' has {size} bytes and the limit is {limit} bytes"
            );
        }
    }
}

/// The places in the served JSON that the launchpad reads without a check for `null`.
///
/// `frontend/src/lib/utils/sns-aggregator-converters.utils.ts` reads `swap_state.swap`,
/// `derived_state`, `init` and `swap_params` without a check.  It converts
/// `derived_state.buyer_total_icp_e8s` to a `BigInt`, which fails on `null`.
/// `frontend/src/lib/derived/sns-parameters.derived.ts` reads the fields of
/// `nervous_system_parameters` without a check.
///
/// Each of those reads happens inside a store that maps EVERY SNS.  A `null` in one SNS therefore
/// empties the whole launchpad.
const PLACES_THAT_MUST_NOT_BE_NULL: &[&[&str]] = &[
    &["swap_state", "swap"],
    &["derived_state"],
    &["derived_state", "buyer_total_icp_e8s"],
    &["derived_state", "sns_tokens_per_icp"],
    &["init"],
    &["swap_params"],
    &["nervous_system_parameters"],
];

/// Converts the record to the JSON that the aggregator serves, and fails on an unreadable null.
fn assert_the_launchpad_can_read(data: &UpstreamData) {
    let served = serde_json::to_value(SlowSnsData::from(data)).expect("Failed to serialise the served record");
    for path in PLACES_THAT_MUST_NOT_BE_NULL {
        let mut value = &served;
        for key in *path {
            value = &value[*key];
        }
        assert!(
            !value.is_null(),
            "The served JSON holds null at '{}'.  One such null empties the whole launchpad.  The record is: {served}",
            path.join(".")
        );
    }
}

/// A record in which four SNS controlled fields are far over their limits.
///
/// `swap_params`, `init` and `derived_state` hold only numbers, so no test can make them
/// too large today.  `an_empty_record_serves_no_null_that_the_launchpad_cannot_read` covers the
/// state that those three reach when a bound does trip.
fn oversized_upstream_data() -> UpstreamData {
    UpstreamData {
        meta: GetMetadataResponse {
            url: None,
            logo: None,
            name: None,
            description: Some("d".repeat(limits::META_DESCRIPTION + 1)),
        },
        icrc1_metadata: vec![(
            "icrc1:logo".to_string(),
            Icrc1Value::Text("A".repeat(limits::ICRC1_METADATA + 1)),
        )],
        nervous_system_parameters: Some(NervousSystemParameters {
            neuron_claimer_permissions: Some(NeuronPermissionList {
                permissions: vec![1; limits::NERVOUS_SYSTEM_PARAMETERS],
            }),
            ..Default::default()
        }),
        swap_state: GetStateResponse {
            swap: Some(Swap {
                purge_old_tickets_next_principal: Some(ByteBuf::from(vec![7u8; limits::SWAP_STATE])),
                ..Default::default()
            }),
            derived: None,
        },
        ..Default::default()
    }
}

#[test]
fn an_oversized_record_serves_no_null_that_the_launchpad_cannot_read() {
    let (data, reasons) = bound_upstream_data(oversized_upstream_data());

    // Each bound must have tripped, and each trip must be reported.
    assert_eq!(reasons.len(), 4, "Expected four reports, got: {reasons:?}");
    assert!(data.meta.description.is_none(), "The description must be emptied");
    assert!(data.icrc1_metadata.is_empty(), "The ledger metadata must be emptied");
    let parameters = data
        .nervous_system_parameters
        .as_ref()
        .expect("The nervous system parameters must be an object");
    assert!(
        parameters.neuron_claimer_permissions.is_none(),
        "The nervous system parameters must be emptied"
    );
    let swap = data.swap_state.swap.as_ref().expect("The swap must be an object");
    assert!(
        swap.purge_old_tickets_next_principal.is_none(),
        "The swap state must be emptied"
    );
    assert!(swap.params.is_none(), "The emptied swap holds no parameters");

    assert_the_launchpad_can_read(&data);
}

#[test]
fn an_empty_record_serves_no_null_that_the_launchpad_cannot_read() {
    // Every field of a default record is empty.  A field reaches this state when its bound trips,
    // because `bound` replaces an oversized value with the default value of its type.
    let (data, reasons) = bound_upstream_data(UpstreamData::default());
    assert!(reasons.is_empty(), "An empty record trips no bound: {reasons:?}");
    assert_the_launchpad_can_read(&data);
}

#[test]
fn an_empty_record_serves_zero_for_the_two_derived_numbers() {
    let (data, _reasons) = bound_upstream_data(UpstreamData::default());
    let derived_state = data.derived_state.expect("The derived state must be an object");
    assert_eq!(derived_state.buyer_total_icp_e8s, Some(0));
    assert_eq!(derived_state.sns_tokens_per_icp, Some(0.0));
}

#[test]
fn fill_unreadable_nulls_keeps_the_values_that_the_sns_supplied() {
    let data = UpstreamData {
        swap_state: GetStateResponse {
            swap: Some(Swap {
                lifecycle: 2,
                ..Default::default()
            }),
            derived: Some(DerivedState {
                buyer_total_icp_e8s: 7,
                sns_tokens_per_icp: 3.0,
                ..Default::default()
            }),
        },
        derived_state: Some(GetDerivedStateResponse {
            buyer_total_icp_e8s: Some(11),
            sns_tokens_per_icp: Some(5.0),
            ..Default::default()
        }),
        init: Some(GetInitResponse { init: None }),
        swap_params: Some(GetSaleParametersResponse { params: None }),
        nervous_system_parameters: Some(NervousSystemParameters {
            reject_cost_e8s: Some(13),
            ..Default::default()
        }),
        ..Default::default()
    };
    let filled = fill_unreadable_nulls(data);
    assert_eq!(filled.swap_state.swap.expect("A swap").lifecycle, 2);
    assert_eq!(
        filled.swap_state.derived.expect("A derived state").buyer_total_icp_e8s,
        7
    );
    let derived_state = filled.derived_state.expect("A derived state response");
    assert_eq!(derived_state.buyer_total_icp_e8s, Some(11));
    assert_eq!(derived_state.sns_tokens_per_icp, Some(5.0));
    assert_eq!(
        filled
            .nervous_system_parameters
            .expect("Nervous system parameters")
            .reject_cost_e8s,
        Some(13)
    );
}

#[test]
fn bound_upstream_data_keeps_a_record_that_is_within_the_limits() {
    let data = UpstreamData {
        meta: GetMetadataResponse {
            url: Some("https://example.com".to_string()),
            logo: None,
            name: Some("A name".to_string()),
            description: Some("A description".to_string()),
        },
        icrc1_metadata: vec![("icrc1:symbol".to_string(), Icrc1Value::Text("TOK".to_string()))],
        ..Default::default()
    };
    let (bounded_data, reasons) = bound_upstream_data(data);
    assert!(reasons.is_empty(), "No bound must trip: {reasons:?}");
    assert_eq!(bounded_data.meta.name.as_deref(), Some("A name"));
    assert_eq!(bounded_data.meta.description.as_deref(), Some("A description"));
    assert_eq!(bounded_data.icrc1_metadata.len(), 1);
}
