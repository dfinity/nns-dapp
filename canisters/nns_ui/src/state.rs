use crate::canister_store::CanisterStore;
use crate::accounts_store::AccountsStore;
use dfn_candid::Candid;
use lazy_static::lazy_static;
use on_wire::{IntoWire, FromWire};
use std::sync::RwLock;

#[derive(Default)]
pub struct State {
    pub accounts_store: AccountsStore,
    pub canisters_store: CanisterStore
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
        Candid((self.accounts_store.encode(), self.canisters_store.encode())).into_bytes().unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let (accounts_store_bytes, canisters_store_bytes): (Vec<u8>, Vec<u8>) = Candid::from_bytes(bytes).map(|c| c.0)?;

        Ok(State {
            accounts_store: AccountsStore::decode(accounts_store_bytes)?,
            canisters_store: CanisterStore::decode(canisters_store_bytes)?
        })
    }
}
