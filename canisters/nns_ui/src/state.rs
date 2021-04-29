use crate::transaction_store::TransactionStore;
use lazy_static::lazy_static;
use std::sync::RwLock;

#[derive(Default)]
pub struct State {
    pub transactions_store: TransactionStore
}

lazy_static! {
    pub static ref STATE: RwLock<State> = RwLock::new(State::default());
}

impl State {
    pub fn encode(&self) -> Vec<u8> {
        self.transactions_store.encode()
    }

    pub fn decode(bytes: &[u8]) -> Result<Self, String> {
        let transactions_store = TransactionStore::decode(bytes).unwrap();

        Ok(State {
            transactions_store
        })
    }
}
