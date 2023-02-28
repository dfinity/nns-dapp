use std::{borrow::Borrow, time::Duration};
use ic_cdk::timer::{TimerId, set_timer_interval};
use crate::{
    state::{STATE, State},
    types::{upstream::SnsCache, upstream::SnsIndex, EmptyRecord, GetStateResponse}, convert_canister_id,
};
use ic_cdk::api::management_canister::provisional::CanisterId;
use std::str::FromStr;

#[derive(Default)]
pub struct FastScheduler {
    /// Last SNS updated
    last_sns_updated: Option<SnsIndex>,
    /// The fast update timer
    update_timer: Option<TimerId>,
}
impl FastScheduler {
    /// Lifecycle of an open swap.  See https://github.com/dfinity/ic/blob/master/rs/sns/swap/proto/ic_sns_swap/pb/v1/swap.proto
    const LIFECYCLE_OPEN: i32 = 2;
    /// Determines whether an SNS is eligible for an update
    fn needs_update(sns_swap_state: &GetStateResponse) -> bool {
        sns_swap_state
            .swap
            .as_ref()
            .map(|swap_state| swap_state.lifecycle == Self::LIFECYCLE_OPEN)
            .unwrap_or(false)
    }
    /// Iterates over SNSs, showing for each whether it needs an update.
    fn needs_update_iter<'a>(
        sns_cache: &'a SnsCache,
    ) -> impl Iterator<Item = Option<&'a SnsIndex>> + Sized + DoubleEndedIterator {
        sns_cache.all_sns.iter().map(|(index, canister_ids)| {
            let needs_update = canister_ids
                .root_canister_id
                .and_then(|root_canister_id| {
                    sns_cache
                        .upstream_data
                        .get(&root_canister_id)
                        .map(|upstream_data| Self::needs_update(&upstream_data.swap_state))
                })
                .unwrap_or(false);
            if needs_update {
                Some(index)
            } else {
                None
            }
        })
    }
    /// Identifies the next SNS to update.
    /// 
    /// The search uses the data collected by the slow updater.  It searches through the SNSs in the order
    /// they are listed in the nns-sns-wasm canister, searching forwards and looping round to the beginning
    /// when it reaches the end of the list.
    /// 
    /// For each SNS, the search checks whether the SNS is eligible and skips SNSs that are not.
    fn next() -> Option<SnsIndex> {
        STATE.with(|state| {
            let sns_stable = state.stable.borrow();
            let sns_cache = sns_stable.sns_cache.borrow();
            // We will search forwards, starting after the last updated value, looping around at the end if necessary.
            let last_sns_update = state.fast_scheduler.borrow().last_sns_updated.unwrap_or_default();
            let iter = Self::needs_update_iter(&sns_cache)
                .skip(last_sns_update as usize + 1)
                .chain(Self::needs_update_iter(&sns_cache).take(last_sns_update as usize + 1));
            let index_maybe = iter.filter_map(|x| x).next().copied();
            state.fast_scheduler.borrow_mut().last_sns_updated = index_maybe;
            index_maybe
        })
    }
    /// Gets data
    async fn update(index: SnsIndex) {
        crate::state::log(format!("Updating SNS index {index} swap state..."));
        let swap_canister_id = STATE.with(|state| convert_canister_id!(state.swap_canister_from_index(index)));
        let root_canister_id = STATE.with(|state| convert_canister_id!(state.root_canister_from_index(index)));
        let swap_state: GetStateResponse = ic_cdk::api::call::call(swap_canister_id, "get_state", (EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| crate::state::log(format!("Failed to get swap state: {err:?}")))
            .unwrap_or_default();
        // Save the state
        STATE.with(|state| {
            state.stable.borrow().sns_cache.borrow_mut().upstream_data.entry(root_canister_id).and_modify(|entry| {
                entry.swap_state = swap_state;
            });
        });
        // Update affected assets
        let slow_data = STATE.with(|state| {
            state.stable.borrow().sns_cache.borrow_mut().upstream_data[&root_canister_id].clone()
        });
        State::insert_sns(index, slow_data)
        .map_err(|err| crate::state::log(format!("Failed to update certified assets: {err:?}")))
        .unwrap_or_default();
        crate::state::log(format!("Updating SNS index {index}... DONE"));
    }
    /// Gets the next SNS in need of updating, if any
    async fn update_next() {
        if let Some(next) = Self::next(){
            Self::update(next).await;
        } else {
            crate::state::log(format!("No SNS to update."));
        }
    }

    /// Starts the update timer.
    pub fn start() {
        let timer_interval = Duration::from_millis(STATE.with(|s| s.stable.borrow().config.borrow().update_interval_ms));
        crate::state::log(format!("Set interval to {}", &timer_interval.as_millis()));
        STATE.with(|state| {
            let timer_id = set_timer_interval(timer_interval, || ic_cdk::spawn(Self::update_next()));
            let old_timer = state.timer_id.replace_with(|_| Some(timer_id));
            if let Some(id) = old_timer {
                ic_cdk::timer::clear_timer(id);
            }
        });
    }
    /// Maybe start a timer, depending on information about the provided SNS.
    ///
    fn start_maybe() {}
}
