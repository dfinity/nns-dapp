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
