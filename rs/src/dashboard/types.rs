pub mod state {
    use crate::canisters::xrc::candid::ExchangeRate;
    use candid::CandidType;
    use serde::Deserialize;
    use std::collections::HashMap;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Dashboard {
        pub exchange_rates: HashMap<String, ExchangeRate>,
    }
}

pub mod interface {
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub struct FetchExchangeRateArgs {
        pub base_symbol: Option<String>,
        pub quote_symbol: Option<String>,
    }
}
