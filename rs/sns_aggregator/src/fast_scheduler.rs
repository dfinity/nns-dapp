//! Code for collecting a subset of data with higher frequency.
use crate::{
    convert_canister_id,
    state::{State, STATE},
    types::{upstream::SnsCache, upstream::SnsIndex, EmptyRecord, GetStateResponse},
};
use ic_cdk::api::management_canister::provisional::CanisterId;
use ic_cdk::{
    api::time,
    timer::{clear_timer, set_timer, set_timer_interval, TimerId},
};
use std::str::FromStr;
use std::{borrow::Borrow, time::Duration};

/// Collects a subset of data with high frequency during an open sale.
#[derive(Default)]
pub struct FastScheduler {
    /// Last SNS updated
    last_sns_updated: Option<SnsIndex>,
    /// The fast update timer
    update_timer: Option<TimerId>,
    /// The time of the next sale start, with a trigger to start collecting data then.
    ///
    /// The time is in seconds since the UNIX epoch, as provided by ic0::time() / 1_000_000_000.
    /// See: https://internetcomputer.org/docs/current/references/ic-interface-spec#system-api-time
    next_start_seconds: Option<(u64, TimerId)>,
}
impl FastScheduler {
    /// Lifecycle of an open swap with an active sale.  See https://github.com/dfinity/ic/blob/master/rs/sns/swap/proto/ic_sns_swap/pb/v1/swap.proto
    const LIFECYCLE_OPEN: i32 = 2;
    /// A lifecycle state that can lead to open.
    const LIFECYCLE_PENDING: i32 = 1;
    /// A lifecycle state that can lead to open.
    const LIFECYCLE_ADOPTED: i32 = 5;
    /// Lifecycle states that need fast data collection either now or in the future.
    /// SNSs in other lifecycle states are ignored by this scheduler.
    const LIFECYCLES_TO_WATCH: [i32; 3] = [Self::LIFECYCLE_ADOPTED, Self::LIFECYCLE_PENDING, Self::LIFECYCLE_OPEN];
    /// How long before an SNS starts, it is eligible for fast swap updates.
    const FAST_BEFORE_SECONDS: u64 = 60;
    /// Determines whether an SNS is eligible for an update
    fn needs_update(sns_swap_state: &GetStateResponse, time_now_seconds: u64) -> bool {
        sns_swap_state
            .swap
            .as_ref()
            .map(|swap_state| match swap_state.lifecycle {
                Self::LIFECYCLE_OPEN => true,
                Self::LIFECYCLE_ADOPTED => swap_state
                    .decentralization_sale_open_timestamp_seconds
                    .map(|open_time| open_time + Self::FAST_BEFORE_SECONDS >= time_now_seconds)
                    .unwrap_or(false),
                _ => false,
            })
            .unwrap_or(false)
    }
    /// Iterates over SNSs, showing for each whether it needs an update.
    fn needs_update_iter(
        sns_cache: &'_ SnsCache,
        time_now_seconds: u64,
    ) -> impl Iterator<Item = Option<&'_ SnsIndex>> + Sized + DoubleEndedIterator {
        sns_cache.all_sns.iter().map(move |(index, canister_ids)| {
            let needs_update = canister_ids
                .root_canister_id
                .and_then(|root_canister_id| {
                    sns_cache
                        .upstream_data
                        .get(&root_canister_id)
                        .map(|upstream_data| Self::needs_update(&upstream_data.swap_state, time_now_seconds))
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
    fn global_next() -> Option<SnsIndex> {
        let time_now_seconds = time() / 1_000_000_000;
        STATE.with(|state| {
            let sns_stable = state.stable.borrow();
            let sns_cache = sns_stable.sns_cache.borrow();
            // We will search forwards, starting after the last updated value, looping around at the end if necessary.
            let last_sns_update = state.fast_scheduler.borrow().last_sns_updated.unwrap_or_default();
            let iter = Self::needs_update_iter(&sns_cache, time_now_seconds)
                .skip(last_sns_update as usize + 1)
                .chain(Self::needs_update_iter(&sns_cache, time_now_seconds).take(last_sns_update as usize + 1));
            let index_maybe = iter.flatten().next().copied();
            state.fast_scheduler.borrow_mut().last_sns_updated = index_maybe;
            index_maybe
        })
    }
    /// Gets data, updating the global state.
    async fn global_update(index: SnsIndex) {
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
            state
                .stable
                .borrow()
                .sns_cache
                .borrow_mut()
                .upstream_data
                .entry(root_canister_id)
                .and_modify(|entry| {
                    entry.swap_state = swap_state;
                });
        });
        // Update affected assets
        let slow_data =
            STATE.with(|state| state.stable.borrow().sns_cache.borrow_mut().upstream_data[&root_canister_id].clone());
        State::insert_sns(index, slow_data)
            .map_err(|err| crate::state::log(format!("Failed to update certified assets: {err:?}")))
            .unwrap_or_default();
        crate::state::log(format!("Updating SNS index {index}... DONE"));
    }

    /// Update the next SNS, if any.  Else pause updates until the next known sale.
    async fn global_update_next() {
        if let Some(next) = Self::global_next() {
            Self::global_update(next).await;
        } else {
            crate::state::log("No SNS to update.".to_string());
            // Pause until the next SNS sale is about to start
            Self::global_stop();
            Self::global_schedule_state();
        }
    }

    /// Stop collecting data now.
    pub fn stop(&mut self) {
        if let Some(timer_id) = self.update_timer.take() {
            ic_cdk::timer::clear_timer(timer_id);
        }
    }

    /// Starts the update timer using the global state.
    pub fn global_stop() {
        STATE.with(|state| {
            state.fast_scheduler.borrow_mut().stop();
        });
    }

    /// Start collecting data now.
    pub fn start(&mut self, timer_interval: Duration) {
        let timer_id = set_timer_interval(timer_interval, || ic_cdk::spawn(Self::global_update_next()));
        let old_timer = self.update_timer.replace(timer_id);
        if let Some(id) = old_timer {
            ic_cdk::timer::clear_timer(id);
        }
        self.next_start_seconds = None;
    }

    /// Starts the update timer using the global state.
    pub fn global_start() {
        let timer_interval = Duration::from_millis(STATE.with(|s| s.stable.borrow().config.borrow().fast_interval_ms));
        crate::state::log(format!("Set interval to {}", &timer_interval.as_millis()));
        STATE.with(|state| {
            state.fast_scheduler.borrow_mut().start(timer_interval);
        });
    }

    /// Start collecting data at some time in the future.
    ///
    /// Note: We request both the delay and the timestamp to avoid making a syscall for data that
    /// is almost certainly already available to the caller.
    pub fn global_start_at(start_seconds: u64, delay: Duration) {
        let start_timer = set_timer(delay, Self::global_start);
        if let Some((_, old_timer)) = STATE.with(|state| {
            state
                .fast_scheduler
                .borrow_mut()
                .next_start_seconds
                .replace((start_seconds, start_timer))
        }) {
            clear_timer(old_timer);
        }
    }

    /// When to start collecting data, depending on information about the provided SNS.
    fn start_time_for_sns(&self, swap_state: &GetStateResponse) -> Result<(u64, Duration), &'static str> {
        // Are we already running?
        if self.update_timer.is_some() {
            return Err("Already running.");
        }
        // Does the SNS have swap state?
        let swap = swap_state.swap.as_ref().ok_or("SNS has no swap.")?;
        // Is a start scheduled?
        let sale_start_seconds = swap
            .decentralization_sale_open_timestamp_seconds
            .ok_or("SNS sale has no time.")?;
        // We would want to start a bit before the sale.
        let data_collection_start_seconds = sale_start_seconds - 10;
        // Has the sale stage passed?
        if !Self::LIFECYCLES_TO_WATCH.contains(&swap.lifecycle) {
            return Err("Lifecycle stage has passed.");
        }
        // Is the start time after our next scheduled start time?  If so it's not interesting yet.
        if let Some((time, _timer)) = self.next_start_seconds {
            if data_collection_start_seconds >= time {
                return Err("Another SNS starts beforehand.");
            }
        }
        // Ok, make sure that we are running when the sale starts.
        let now_seconds = time() / 1_000_000_000;
        // Already started, or starting soon?
        let delay = if data_collection_start_seconds < now_seconds {
            0
        } else {
            data_collection_start_seconds - now_seconds
        };
        Ok((data_collection_start_seconds, Duration::from_secs(delay)))
    }

    /// Schedule the given SNS, if needed.  This should be called by the slow updater whenever
    /// it has a new SNS.
    pub fn global_schedule_sns(swap_state: &GetStateResponse) {
        match STATE.with(|state| state.fast_scheduler.borrow().start_time_for_sns(swap_state)) {
            Ok((start_seconds, delay)) => {
                crate::state::log(format!("Scheduling fast restart in {} seconds...", delay.as_secs()));
                Self::global_start_at(start_seconds, delay);
            }
            Err(msg) => {
                crate::state::log(format!("SNS does not need fast updates: {msg}"));
            }
        }
    }
    /// Schedule SNSs in the given state, if needed.
    fn global_schedule_state() {
        if let Some((start_seconds, delay)) = STATE.with(Self::start_time_for_state) {
            Self::global_start_at(start_seconds, delay);
        }
    }

    /// When we need to start collecting data for the SNSs in the given state.
    fn start_time_for_state(state: &State) -> Option<(u64, Duration)> {
        let this = state.fast_scheduler.borrow();
        state
            .stable
            .borrow()
            .sns_cache
            .borrow()
            .upstream_data
            .borrow()
            .values()
            .filter_map(|value| this.start_time_for_sns(&value.swap_state).ok())
            .reduce(|a, b| if a.0 < b.0 { a } else { b })
    }
}
