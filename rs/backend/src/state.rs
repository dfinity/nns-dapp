use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use dfn_candid::Candid;
use dfn_core::{api::trap_with, stable};
use ic_stable_structures::{DefaultMemoryImpl, Memory};
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
    fn schema_version_from_stable_memory() -> Option<SchemaLabel> {
        let memory = DefaultMemoryImpl::default();
        Self::schema_version_from_memory(&memory)
    }

    /// The schema version, as stored in an arbitrary memory.
    fn schema_version_from_memory<M>(memory: &M) -> Option<SchemaLabel>
    where
        M: Memory,
    {
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        memory.read(0, &mut schema_label_bytes);
        SchemaLabel::try_from(&schema_label_bytes[..]).ok()
    }

    /// Create the state from stable memory in the `post_upgrade()` hook.
    ///
    /// Note: The stable memory may have been created by any of these schemas:
    /// - The previous schema, when first migrating from the previous schema to the current schema.
    /// - The current schema, if upgrading without changing the schema.
    /// - The next schema, if a new schema was deployed and we need to roll back.
    ///
    /// Note: Changing the schema requires at least two deployments:
    /// - Deploy a release with a parser for the new schema.
    /// - Then, deploy a release that writes the new schema.
    /// This way it is possible to roll back after deploying the new schema.
    pub fn post_upgrade(args_schema: Option<SchemaLabel>) -> Self {
        // If we are unable to read the schema label, we assume that we have just the heap data serialized as candid.
        let current_schema = Self::schema_version_from_stable_memory().unwrap_or(SchemaLabel::Map);
        let desired_schema = args_schema.unwrap_or(current_schema);
        match (current_schema, desired_schema) {
            (SchemaLabel::Map, SchemaLabel::Map) => Self::recover_state_from_map(),
            (SchemaLabel::Map, SchemaLabel::AccountsInStableMemory) => {
                dfn_core::api::print(format!("Unsupported migration from {current_schema:?} to {desired_schema:?}.  Keeping data in the existing form."));
                Self::recover_state_from_map()
            }
            (SchemaLabel::AccountsInStableMemory, _) => {
                trap_with(&format!(
                    "Unsupported migration from {current_schema:?} to {desired_schema:?}.  Bailing out..."
                ));
                unreachable!();
            }
        }
    }
    /// Save any unsaved state to stable memory.
    pub fn pre_upgrade(&self) {
        self.save_as_map()
    }
}

// State from/to the `SchemaLabel::Map` format.
impl State {
    /// Save any unsaved state to stable memory in the `SchemaLabel::Map` format.
    fn save_as_map(&self) {
        let bytes = self.encode();
        stable::set(&bytes);
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    fn recover_state_from_map() -> Self {
        let bytes = stable::get();
        State::decode(bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
            unreachable!();
        })
    }
}
