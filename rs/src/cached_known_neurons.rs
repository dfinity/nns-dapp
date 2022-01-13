use crate::{canisters, KnownNeuron};
use ic_nns_common::types::NeuronId;
use std::cell::{Cell, RefCell};
use std::convert::TryInto;
use std::time::SystemTime;

const REFRESH_INTERVAL_MS: u64 = 10 * 60 * 1000; // 10 minutes

thread_local! {
    static LAST_REFRESH_STARTED_AT_TIMESTAMP_MS: Cell<u64> = Cell::default();
    static CACHED_KNOWN_NEURONS: RefCell<Vec<KnownNeuron>> = RefCell::new(default_known_neurons());
}

// Once every 10 minutes this will query the governance canister to get the list of known neurons.
// Those neurons are then appended onto the default known neurons and cached for quick access.
pub async fn refresh_if_due() {
    if mark_started_if_due() {
        match canisters::governance::list_known_neurons().await {
            Ok(response) => {
                let mut known_neurons = default_known_neurons();
                known_neurons.extend(response.known_neurons.into_iter().filter_map(|n| n.try_into().ok()));

                CACHED_KNOWN_NEURONS.with(|n| *n.borrow_mut() = known_neurons);
            }
            Err(_error) => {
                // TODO log these errors
            }
        }
    }
}

pub fn get() -> Vec<KnownNeuron> {
    CACHED_KNOWN_NEURONS.with(|n| n.borrow().clone())
}

fn mark_started_if_due() -> bool {
    let timestamp_ms = dfn_core::api::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    LAST_REFRESH_STARTED_AT_TIMESTAMP_MS.with(|t| {
        if timestamp_ms > t.get() + REFRESH_INTERVAL_MS {
            t.set(timestamp_ms);
            true
        } else {
            false
        }
    })
}

fn default_known_neurons() -> Vec<KnownNeuron> {
    vec![
        KnownNeuron::new(NeuronId(27), "DFINITY Foundation".to_string(), None),
        KnownNeuron::new(NeuronId(28), "Internet Computer Association".to_string(), None),
    ]
}
