use crate::accounts_store::AccountsStore;
use lazy_static::lazy_static;
use std::sync::RwLock;

#[derive(Default)]
pub struct State {
    pub accounts_store: AccountsStore,
}

pub trait StableState: Sized {
    fn encode(&self) -> Vec<u8>;
    fn decode(bytes: Vec<u8>) -> Result<Self, String>;
}

lazy_static! {
    pub static ref STATE: RwLock<State> = RwLock::new(State::default());
}

impl StableState for State {
    fn encode(&self) -> Vec<u8> {
        self.accounts_store.encode()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        Ok(State {
            accounts_store: AccountsStore::decode(bytes)?,
        })
    }
}
