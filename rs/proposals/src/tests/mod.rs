//! Tests that the proposals crate can indeed express proposals as JSON.
use super::*;

use crate::{
    canisters::nns_governance::api::{InstallCode, NeuronId, Proposal},
    tests::payloads::get_payloads,
};

use ic_principal::Principal;

mod args;
mod payloads;

#[test]
fn payload_deserialization() {
    for (nns_function_id, payload) in get_payloads() {
        let transformed = transform_payload_to_json(nns_function_id, &payload);
        assert!(transformed.is_ok());
        println!("{}", transformed.unwrap());
    }
}

/// Constructs a `ProposalInfo` with the given action for testing.
fn proposal_info_with_action(action: Action) -> ProposalInfo {
    ProposalInfo {
        id: Some(NeuronId { id: 1 }),
        status: 1,
        topic: 1,
        failure_reason: None,
        ballots: vec![],
        proposal_timestamp_seconds: 1,
        reward_event_round: 1,
        deadline_timestamp_seconds: None,
        failed_timestamp_seconds: 0,
        reject_cost_e8s: 0,
        derived_proposal_information: None,
        latest_tally: None,
        reward_status: 1,
        decided_timestamp_seconds: 1,
        proposal: Some(Box::new(Proposal {
            url: "".to_string(),
            summary: "".to_string(),
            title: None,
            action: Some(action),
        })),
        proposer: None,
        executed_timestamp_seconds: 1,
    }
}
