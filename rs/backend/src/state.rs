use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use dfn_candid::Candid;
use dfn_core::{api::trap_with, stable};
use on_wire::{FromWire, IntoWire};
use std::cell::RefCell;
#[cfg(test)]
pub mod tests;

#[derive(Default, Debug, Eq, PartialEq)]
pub struct State {
    // NOTE: When adding new persistent fields here, ensure that these fields
    // are being persisted in the `replace` method below.
    pub accounts_store: RefCell<AccountsStore>,
    pub assets: RefCell<Assets>,
    pub asset_hashes: RefCell<AssetHashes>,
    pub performance: RefCell<PerformanceCounts>,
}

impl State {
    pub fn replace(&self, new_state: State) {
        self.accounts_store.replace(new_state.accounts_store.take());
        self.assets.replace(new_state.assets.take());
        self.asset_hashes.replace(new_state.asset_hashes.take());
        self.performance.replace(new_state.performance.take());
    }
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
        Candid((self.accounts_store.borrow().encode(), self.assets.borrow().encode()))
            .into_bytes()
            .unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let (account_store_bytes, assets_bytes) = Candid::from_bytes(bytes).map(|c| c.0)?;

        let assets = Assets::decode(assets_bytes)?;
        let asset_hashes = AssetHashes::from(&assets);
        let performance = PerformanceCounts::default();

        Ok(State {
            accounts_store: RefCell::new(AccountsStore::decode(account_store_bytes)?),
            assets: RefCell::new(assets),
            asset_hashes: RefCell::new(asset_hashes),
            performance: RefCell::new(performance),
        })
    }
}

// Methods called on pre_upgrade and post_upgrade.
impl State {
    /// The schema version, determined by the last version that was saved to stable memory.
    fn schema_version_from_stable_memory() -> Option<u32> {
        None // The schema is currently unversioned.
    }
    /// Create the state from stable memory in the post_upgrade() hook.
    ///
    /// Note: The stable memory may have been created by any of these schemas:
    /// - The previous schema, when first migrating from th eprevious schema to the current schema.
    /// - The curent schema, if upgrading without chnaging the schema.
    /// - The next schema, if a new schema was deployed and we need to roll back.
    ///
    /// Note: Changing the schema requires at least two deployments:
    /// - Deploy a relase with a parser for the new schema.
    /// - Then, deploy a release that writes the new schema.
    /// This way it is possible to roll back after deploying the new schema.
    pub fn post_upgrade() -> Self {
        match Self::schema_version_from_stable_memory() {
            None => self.post_upgrade_unversioned(),
            Some(version) => trap_with(&format!("Unknown schema version: {version}")),
        }
    }
    /// Save any unsaved state to stable memory.
    pub fn pre_upgrade(&self) {
        self.pre_upgrade_unversioned()
    }
}

// The unversionsed schema.
impl State {
    /// Save any unsaved state to stable memory.
    fn pre_upgrade_unversioned(&self) {
        let bytes = self.encode();
        stable::set(&bytes);
    }
    /// Create the state from stable memory in the post_upgrade() hook.
    fn post_upgrade_unversioned() -> Self {
        let bytes = stable::get();
        State::decode(bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
            unreachable!();
        })
    }
}
