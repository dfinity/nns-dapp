use crate::canisters::xrc::candid::ExchangeRate;
use crate::dashboard::types::state::Dashboard;
use crate::state::StableState;
use dfn_candid::Candid;
use on_wire::{FromWire, IntoWire};
use std::collections::HashMap;

impl StableState for Dashboard {
    fn encode(&self) -> Vec<u8> {
        Candid((&self.exchange_rates,)).into_bytes().unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        #[allow(clippy::type_complexity)]
        let (exchange_rates,): (HashMap<String, ExchangeRate>,) = Candid::from_bytes(bytes).map(|c| c.0)?;

        Ok(Dashboard { exchange_rates })
    }
}

impl Dashboard {
    pub fn get_exchange_rate(&self, key: &String) -> Option<ExchangeRate> {
        self.exchange_rates.get(key).cloned()
    }

    pub fn set_exchange_rate(&mut self, key: &str, rate: &ExchangeRate) {
        self.exchange_rates.insert(key.to_owned(), rate.clone());
    }
}
