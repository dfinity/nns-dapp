use std::{borrow::Borrow, time::Duration};
use ic_cdk::timer::{TimerId, set_timer_interval};
use crate::{
    state::STATE,
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
        crate::state::log(format!("Updating SNS index {index}... get_state"));
        let swap_canister_id = STATE.with(|state| convert_canister_id!(state.swap_canister_from_index(index)));
        let root_canister_id = STATE.with(|state| convert_canister_id!(state.root_canister_from_index(index)));
        let swap_state: GetStateResponse = ic_cdk::api::call::call(swap_canister_id, "get_state", (EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| crate::state::log(format!("Failed to get swap state: {err:?}")))
            .unwrap_or_default();
        STATE.with(|state| {
            state.stable.borrow().sns_cache.borrow_mut().upstream_data.entry(root_canister_id).and_modify(|entry| {
                entry.swap_state = swap_state;
            });
        });
    }
    /// Gets the next SNS in need of updating, if any
    async fn update_next() {
        Self::next().map(Self::update);
    }

    /// Starts the update timer.
    fn start(&mut self) {
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
