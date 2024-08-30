use crate::tvl::{self, governance, time, xrc, STATE};

fn icp_asset() -> xrc::Asset {
    xrc::Asset {
        symbol: "ICP".to_string(),
        class: xrc::AssetClass::Cryptocurrency,
    }
}

fn usd_asset() -> xrc::Asset {
    xrc::Asset {
        symbol: "USD".to_string(),
        class: xrc::AssetClass::FiatCurrency,
    }
}

fn get_usd_per_icp_e8s() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().usd_per_icp_e8s)
}

fn set_usd_per_icp_e8s(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().usd_per_icp_e8s = new_value);
}

fn get_exchange_rate_timestamp_sec() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().exchange_rate_timestamp_sec)
}

fn set_exchange_rate_timestamp_sec(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().exchange_rate_timestamp_sec = new_value);
}

fn get_only_xrc_request() -> xrc::GetExchangeRateRequest {
    let mut requests = xrc::testing::drain_requests();
    assert_eq!(requests.len(), 1);
    requests.pop().unwrap()
}

fn get_expected_exchange_rate_request(timestamp_sec: u64) -> xrc::GetExchangeRateRequest {
    xrc::GetExchangeRateRequest {
        base_asset: icp_asset(),
        quote_asset: usd_asset(),
        timestamp: Some(timestamp_sec),
    }
}

fn get_total_locked_icp_e8s() -> u64 {
    STATE.with(|s| s.tvl_state.borrow().total_locked_icp_e8s)
}

fn set_total_locked_icp_e8s(new_value: u64) {
    STATE.with(|s| s.tvl_state.borrow_mut().total_locked_icp_e8s = new_value);
}

#[tokio::test]
async fn update_exchange_rate() {
    let now_sec = 1_234_567_890;
    // We request the exchange rate from 5 minutes ago to make sure the XRC
    // actually has data for the timestamp we request.
    let five_minutes_ago_sec = now_sec - 5 * 60;

    let initial_usd_per_icp_e8s = 850_000_000;
    let later_usd_per_icp_e8s = 920_000_000;

    // Step 1: Set up the environment.
    time::testing::set_time(now_sec * 1_000_000_000);
    set_usd_per_icp_e8s(initial_usd_per_icp_e8s);
    xrc::testing::add_exchange_rate_response_ok(icp_asset(), usd_asset(), later_usd_per_icp_e8s, five_minutes_ago_sec);

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_per_icp_e8s(), initial_usd_per_icp_e8s);
    assert_eq!(xrc::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    assert_eq!(
        get_only_xrc_request(),
        get_expected_exchange_rate_request(five_minutes_ago_sec)
    );
    assert_eq!(get_usd_per_icp_e8s(), later_usd_per_icp_e8s);
    assert_eq!(get_exchange_rate_timestamp_sec(), five_minutes_ago_sec);
}

#[tokio::test]
async fn update_exchange_rate_with_call_error() {
    let now_sec = 1_234_567_890;
    // We request the exchange rate from 5 minutes ago to make sure the XRC
    // actually has data for the timestamp we request.
    let five_minutes_ago_sec = now_sec - 5 * 60;

    let initial_usd_per_icp_e8s = 0;
    let initial_exchange_rate_timestamp_sec = 0;

    // Step 1: Set up the environment.
    time::testing::set_time(now_sec * 1_000_000_000);
    set_usd_per_icp_e8s(initial_usd_per_icp_e8s);
    set_exchange_rate_timestamp_sec(initial_exchange_rate_timestamp_sec);
    xrc::testing::add_exchange_rate_response(Err("Canister is stopped".to_string()));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_per_icp_e8s(), initial_usd_per_icp_e8s);
    assert_eq!(get_exchange_rate_timestamp_sec(), initial_exchange_rate_timestamp_sec);
    assert_eq!(xrc::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    assert_eq!(
        get_only_xrc_request(),
        get_expected_exchange_rate_request(five_minutes_ago_sec)
    );
    // The exchange rate should not have been updated because of the error.
    assert_eq!(get_usd_per_icp_e8s(), initial_usd_per_icp_e8s);
    assert_eq!(get_exchange_rate_timestamp_sec(), initial_exchange_rate_timestamp_sec);
}

#[tokio::test]
async fn update_exchange_rate_with_method_error() {
    let now_sec = 1_234_567_890;
    // We request the exchange rate from 5 minutes ago to make sure the XRC
    // actually has data for the timestamp we request.
    let five_minutes_ago_sec = now_sec - 5 * 60;

    let initial_usd_per_icp_e8s = 0;
    let initial_exchange_rate_timestamp_sec = 0;

    // Step 1: Set up the environment.
    time::testing::set_time(now_sec * 1_000_000_000);
    set_usd_per_icp_e8s(initial_usd_per_icp_e8s);
    set_exchange_rate_timestamp_sec(initial_exchange_rate_timestamp_sec);
    xrc::testing::add_exchange_rate_response(Ok(xrc::GetExchangeRateResult::Err(
        xrc::ExchangeRateError::CryptoBaseAssetNotFound,
    )));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_usd_per_icp_e8s(), initial_usd_per_icp_e8s);
    assert_eq!(get_exchange_rate_timestamp_sec(), initial_exchange_rate_timestamp_sec);
    assert_eq!(xrc::testing::drain_requests().len(), 0);

    // Step 3: Call the code under test.
    tvl::update_exchange_rate().await;

    // Step 4: Verify the state after calling the code under test.
    assert_eq!(
        get_only_xrc_request(),
        get_expected_exchange_rate_request(five_minutes_ago_sec)
    );
    // The exchange rate should not have been updated because of the error.
    assert_eq!(get_usd_per_icp_e8s(), initial_usd_per_icp_e8s);
    assert_eq!(get_exchange_rate_timestamp_sec(), initial_exchange_rate_timestamp_sec);
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
