use crate::accounts_store::AccountsStore;
use std::cell::RefCell;

#[derive(Default)]
pub struct State {
    // NOTE: When adding new persistent fields here, ensure that these fields
    // are being persisted in the post_upgrade method.
    pub accounts_store: RefCell<AccountsStore>,
}

pub trait StableState: Sized {
    fn encode(&self) -> Vec<u8>;
    fn decode(bytes: Vec<u8>) -> Result<Self, String>;
}

thread_local! {
    pub static STATE: State = State::default();
}

impl StableState for State {
    fn encode(&self) -> Vec<u8> {
        self.accounts_store.borrow().encode()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        Ok(State {
            accounts_store: RefCell::new(AccountsStore::decode(bytes)?),
        })
    }
}
