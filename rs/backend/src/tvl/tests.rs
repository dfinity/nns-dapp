use crate::timer;
use crate::tvl::{self, exchange_rate_canister, governance, spawn, time, STATE};
use lazy_static::lazy_static;

const NOW_SECONDS: u64 = 1_234_567_890;
// We request the exchange rate from 5 minutes ago to make sure the XRC
// actually has data for the timestamp we request.
const FIVE_MINUTES_AGO_SECONDS: u64 = NOW_SECONDS - 5 * 60;
const SIX_HOURS_SECONDS: u64 = 6 * 60 * 60;

lazy_static! {
    static ref ICP: exchange_rate_canister::Asset = exchange_rate_canister::Asset {
        symbol: "ICP".to_string(),
        class: exchange_rate_canister::AssetClass::Cryptocurrency,
    };
    static ref USD: exchange_rate_canister::Asset = exchange_rate_canister::Asset {
        symbol: "USD".to_string(),
        class: exchange_rate_canister::AssetClass::FiatCurrency,
    };
}

fn get_usd_e8s_per_icp() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().usd_e8s_per_icp)
}

fn set_usd_e8s_per_icp(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().usd_e8s_per_icp = new_value);
}

fn get_exchange_rate_timestamp_seconds() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().exchange_rate_timestamp_seconds)
}

fn set_exchange_rate_timestamp_seconds(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().exchange_rate_timestamp_seconds = new_value);
}

fn get_only_xrc_request() -> exchange_rate_canister::GetExchangeRateRequest {
    let mut requests = exchange_rate_canister::testing::drain_requests();
    assert_eq!(requests.len(), 1);
    requests.pop().unwrap()
}

fn get_total_locked_icp_e8s() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().total_locked_icp_e8s)
}

fn set_total_locked_icp_e8s(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().total_locked_icp_e8s = new_value);
}

#[tokio::test]
async fn update_exchange_rate() {
    let initial_usd_e8s_per_icp = 850_000_000;
    let later_usd_e8s_per_icp = 920_000_000;
    let decimals = 8;

    // Step 1: Set up the environment.
    time::testing::set_time(NOW_SECONDS * 1_000_000_000);
    set_usd_e8s_per_icp(initial_usd_e8s_per_icp);
    exchange_rate_canister::testing::add_exchange_rate_response_ok(
        ICP.clone(),
        USD.clone(),
        later_usd_e8s_per_icp,
        decimals,
        FIVE_MINUTES_AGO_SECONDS,
    );

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    // Step 4.1: Inspect calls to the exchange rate canister.
    assert_eq!(
        get_only_xrc_request(),
        exchange_rate_canister::GetExchangeRateRequest {
            base_asset: ICP.clone(),
            quote_asset: USD.clone(),
            timestamp: Some(FIVE_MINUTES_AGO_SECONDS),
        }
    );
    // Step 4.2: Inspect the state of the nns-dapp canister.
    assert_eq!(get_usd_e8s_per_icp(), later_usd_e8s_per_icp);
    assert_eq!(get_exchange_rate_timestamp_seconds(), FIVE_MINUTES_AGO_SECONDS);
}

#[tokio::test]
async fn update_exchange_rate_with_3_decimals() {
    let initial_usd_e8s_per_icp = 850_000_000;
    let later_usd_e8s_per_icp = 920_000_000;
    let decimals = 3;
    let later_usd_e3s_per_icp = later_usd_e8s_per_icp / 100_000;

    // Step 1: Set up the environment.
    time::testing::set_time(NOW_SECONDS * 1_000_000_000);
    set_usd_e8s_per_icp(initial_usd_e8s_per_icp);
    exchange_rate_canister::testing::add_exchange_rate_response_ok(
        ICP.clone(),
        USD.clone(),
        later_usd_e3s_per_icp,
        decimals,
        FIVE_MINUTES_AGO_SECONDS,
    );

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    // Step 4.1: Inspect calls to the exchange rate canister.
    assert_eq!(
        get_only_xrc_request(),
        exchange_rate_canister::GetExchangeRateRequest {
            base_asset: ICP.clone(),
            quote_asset: USD.clone(),
            timestamp: Some(FIVE_MINUTES_AGO_SECONDS),
        }
    );
    // Step 4.2: Inspect the state of the nns-dapp canister.
    assert_eq!(get_usd_e8s_per_icp(), later_usd_e8s_per_icp);
    assert_eq!(get_exchange_rate_timestamp_seconds(), FIVE_MINUTES_AGO_SECONDS);
}

#[tokio::test]
async fn update_exchange_rate_with_12_decimals() {
    let initial_usd_e8s_per_icp = 850_000_000;
    let later_usd_e8s_per_icp = 920_000_000;
    let decimals = 12;
    let later_usd_e12s_per_icp = later_usd_e8s_per_icp * 10_000;

    // Step 1: Set up the environment.
    time::testing::set_time(NOW_SECONDS * 1_000_000_000);
    set_usd_e8s_per_icp(initial_usd_e8s_per_icp);
    exchange_rate_canister::testing::add_exchange_rate_response_ok(
        ICP.clone(),
        USD.clone(),
        later_usd_e12s_per_icp,
        decimals,
        FIVE_MINUTES_AGO_SECONDS,
    );

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    // Step 4.1: Inspect calls to the exchange rate canister.
    assert_eq!(
        get_only_xrc_request(),
        exchange_rate_canister::GetExchangeRateRequest {
            base_asset: ICP.clone(),
            quote_asset: USD.clone(),
            timestamp: Some(FIVE_MINUTES_AGO_SECONDS),
        }
    );
    // Step 4.2: Inspect the state of the nns-dapp canister.
    assert_eq!(get_usd_e8s_per_icp(), later_usd_e8s_per_icp);
    assert_eq!(get_exchange_rate_timestamp_seconds(), FIVE_MINUTES_AGO_SECONDS);
}

#[tokio::test]
async fn update_exchange_rate_with_call_error() {
    let initial_usd_e8s_per_icp = 0;
    let initial_exchange_rate_timestamp_seconds = 0;

    // Step 1: Set up the environment.
    time::testing::set_time(NOW_SECONDS * 1_000_000_000);
    set_usd_e8s_per_icp(initial_usd_e8s_per_icp);
    set_exchange_rate_timestamp_seconds(initial_exchange_rate_timestamp_seconds);
    exchange_rate_canister::testing::add_exchange_rate_response(Err("Canister is stopped".to_string()));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        initial_exchange_rate_timestamp_seconds
    );
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    // Step 4.1: Inspect calls to the exchange rate canister.
    assert_eq!(
        get_only_xrc_request(),
        exchange_rate_canister::GetExchangeRateRequest {
            base_asset: ICP.clone(),
            quote_asset: USD.clone(),
            timestamp: Some(FIVE_MINUTES_AGO_SECONDS),
        }
    );
    // Step 4.2: Inspect the state of the nns-dapp canister.
    // The exchange rate should not have been updated because of the error.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        initial_exchange_rate_timestamp_seconds
    );
}

#[tokio::test]
async fn update_exchange_rate_with_method_error() {
    let initial_usd_e8s_per_icp = 0;
    let initial_exchange_rate_timestamp_seconds = 0;

    // Step 1: Set up the environment.
    time::testing::set_time(NOW_SECONDS * 1_000_000_000);
    set_usd_e8s_per_icp(initial_usd_e8s_per_icp);
    set_exchange_rate_timestamp_seconds(initial_exchange_rate_timestamp_seconds);
    exchange_rate_canister::testing::add_exchange_rate_response(Ok(
        exchange_rate_canister::GetExchangeRateResult::Err(
            exchange_rate_canister::ExchangeRateError::CryptoBaseAssetNotFound,
        ),
    ));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        initial_exchange_rate_timestamp_seconds
    );
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    // Step 4.1: Inspect calls to the exchange rate canister.
    assert_eq!(
        get_only_xrc_request(),
        exchange_rate_canister::GetExchangeRateRequest {
            base_asset: ICP.clone(),
            quote_asset: USD.clone(),
            timestamp: Some(FIVE_MINUTES_AGO_SECONDS),
        }
    );
    // Step 4.2: Inspect the state of the nns-dapp canister.
    // The exchange rate should not have been updated because of the error.
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        initial_exchange_rate_timestamp_seconds
    );
}

#[tokio::test]
async fn update_locked_icp_e8s() {
    let initial_locked_icp_e8s = 50_000_000_000;
    let later_locked_icp_e8s = 90_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response_with_total_locked_e8s(later_locked_icp_e8s);

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), later_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_call_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response(Err("Canister is stopped".to_string()));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_method_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response(Ok(Err(governance::GovernanceError {
        error_type: 123,
        error_message: "Some error message".to_string(),
    })));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}

#[tokio::test]
async fn init_exchange_rate_timers() {
    tvl::time::testing::set_time(NOW_SECONDS * 1_000_000_000);

    let initial_usd_e8s_per_icp = 850_000_000;
    let later_usd_e8s_per_icp = 920_000_000;
    let decimals = 8;

    let initial_exchange_rate_timestamp_seconds = FIVE_MINUTES_AGO_SECONDS;
    let later_exchange_rate_timestamp_seconds: u64 = FIVE_MINUTES_AGO_SECONDS + 6 * 60 * 60;

    let expected_timer_delay_seconds = 1;
    let expected_timer_interval_seconds = 6 * 60 * 60;

    // There are 3 phases each with a number of steps:
    // Phase 1: Calling the code under test to set timers.
    // Phase 2: Calling the 1-time timer.
    // Phase 3: Calling the interval timer.

    // Phase 1: Calling the code under test to set timers.

    // Step 1: Verify no timers exist before calling the code under test.
    assert_eq!(timer::testing::drain_timers().len(), 0);
    assert_eq!(timer::testing::drain_timer_intervals().len(), 0);

    // Step 2: Call the code under test.
    // This should set both a 1-time timer and an interval timer.
    tvl::init_exchange_rate_timers();

    // Phase 2: Calling the 1-time timer.

    // Step 1: Set up the environment.
    exchange_rate_canister::testing::add_exchange_rate_response_ok(
        ICP.clone(),
        USD.clone(),
        initial_usd_e8s_per_icp,
        decimals,
        initial_exchange_rate_timestamp_seconds,
    );

    // Step 2: Verify the state before calling the 1-time timers.
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the 1-time timer.
    {
        let mut timers = timer::testing::drain_timers();
        assert_eq!(timers.len(), 1);
        let timer = timers.pop().unwrap();
        assert_eq!(
            timer.delay,
            std::time::Duration::from_secs(expected_timer_delay_seconds)
        );
        // The timer calls spawn::spawn, which, during the test, adds the future
        // to a queue.
        (timer.func)();
        // Make sure the spawned future is run.
        let mut spawned_futures = spawn::testing::drain_spawned_futures();
        assert_eq!(spawned_futures.len(), 1);
        spawned_futures.pop().unwrap().await;
    }

    // Step 4: Verify the state after calling the 1-time timer.
    // The request is made because the timer callback calls `update_exchange_rate`.
    // We don't inspect the request here because `update_exchange_rate` is
    // tested separately.
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 1);
    assert_eq!(get_usd_e8s_per_icp(), initial_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        initial_exchange_rate_timestamp_seconds
    );

    // Phase 3: Calling the interval timer.

    // Step 1: Set up the environment.
    tvl::time::testing::set_time((NOW_SECONDS + SIX_HOURS_SECONDS) * 1_000_000_000);
    exchange_rate_canister::testing::add_exchange_rate_response_ok(
        ICP.clone(),
        USD.clone(),
        later_usd_e8s_per_icp,
        decimals,
        later_exchange_rate_timestamp_seconds,
    );

    // Step 2: Verify the state before calling the 1-time timers.
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 0);

    // Step 3: Call the interval timer.
    {
        let mut timers = timer::testing::drain_timer_intervals();
        assert_eq!(timers.len(), 1);
        let mut timer = timers.pop().unwrap();
        assert_eq!(
            timer.interval,
            std::time::Duration::from_secs(expected_timer_interval_seconds)
        );
        // The timer calls spawn::spawn, which, during the test, adds the future
        // to a queue.
        (timer.func)();
        // Make sure the spawned future is run.
        let mut spawned_futures = spawn::testing::drain_spawned_futures();
        assert_eq!(spawned_futures.len(), 1);
        spawned_futures.pop().unwrap().await;
    }

    // Step 4: Verify the state after calling interval timer.
    // The request is made because the timer callback calls `update_exchange_rate`.
    // We don't inspect the request here because `update_exchange_rate` is
    // tested separately.
    assert_eq!(exchange_rate_canister::testing::drain_requests().len(), 1);
    assert_eq!(get_usd_e8s_per_icp(), later_usd_e8s_per_icp);
    assert_eq!(
        get_exchange_rate_timestamp_seconds(),
        later_exchange_rate_timestamp_seconds
    );
}
