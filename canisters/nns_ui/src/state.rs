use crate::accounts_store::AccountsStore;
use dfn_candid::Candid;
use lazy_static::lazy_static;
use on_wire::FromWire;
use std::sync::RwLock;

#[derive(Default)]
pub struct State {
    pub accounts_store: AccountsStore,
}

pub trait StableState : Sized {
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
        // This will throw away the CanisterStore bytes, but that is fine since no canisters have
        // been created yet. Some may have been attached but losing them is fine.
        let (accounts_store_bytes, _): (Vec<u8>, Vec<u8>) = Candid::from_bytes(bytes).map(|c| c.0)?;

        Ok(State {
            accounts_store: AccountsStore::decode(accounts_store_bytes)?,
        })
    }
}
