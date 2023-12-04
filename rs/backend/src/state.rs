use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::AccountsStore;
use crate::arguments::CanisterArguments;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use core::cell::RefCell;
use dfn_candid::Candid;
use dfn_core::api::trap_with;
use ic_stable_structures::DefaultMemoryImpl;
use on_wire::{FromWire, IntoWire};
use partitions::Partitions;
use std::borrow::BorrowMut;

pub mod partitions;
#[cfg(test)]
pub mod tests;
#[cfg(test)]
use core::convert::TryFrom;
#[cfg(test)]
use ic_stable_structures::Memory;

pub mod with_accounts_in_stable_memory;
pub mod with_raw_memory;

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

// TODO: Probably eliminate this trait, as serialization is now different depending on which schema is in use, making this fundamentally ambiguous.
pub trait StableState: Sized {
    fn encode(&self) -> Vec<u8>;
    fn decode(bytes: Vec<u8>) -> Result<Self, String>;
}

thread_local! {
    pub static STATE: State = State::default();
}

impl State {
    /// Creates new state with the specified schema.
    pub fn new(schema: SchemaLabel, partitions_maybe: Result<Partitions, DefaultMemoryImpl>) -> Self {
        let mut state = Self::default();
        match schema {
            SchemaLabel::Map => {
                dfn_core::api::print("New State: Map");
                state
            }
            SchemaLabel::AccountsInStableMemory => {
                dfn_core::api::print("New State: AccountsInStableMemory");
                let partitions = partitions_maybe.unwrap_or_else(|_memory| {
                    trap_with("New state: Partitions should have been prepared.");
                    unreachable!();
                });
                let accounts_store =
                    AccountsStore::new_with_unbounded_stable_btree_map(partitions.get(Partitions::ACCOUNTS_MEMORY_ID));
                state.borrow_mut().accounts_store.replace(accounts_store);
                //let accounts_store = StableBTreeMap::new(partitions.get(Partitions::ACCOUNTS_MEMORY_ID));
                //state.accounts_store.borrow_mut().accounts_db
                state
            }
        }
    }
    /// Applies the specified arguments to the state.
    pub fn with_arguments(self, _arguments: &CanisterArguments) -> Self {
        // TODO: If a migration is needed, kick it off.
        // TODO: Initialize assets and asset_hashes
        self
    }
    /// Applies the specified arguments, if provided
    pub fn with_arguments_maybe(self, arguments_maybe: Option<&CanisterArguments>) -> Self {
        match arguments_maybe {
            Some(arguments) => self.with_arguments(arguments),
            None => self,
        }
    }
}

/// Loads state from given memory partitions.
///
/// Typical usage:
/// - On upgrading a canister, get partitions from raw memory.
/// - From the partitions, get the state.
/// - Have a fallback to support the stable memory layout without partitions.
/// The state structure then owns everything on the heap and in stable memory.
impl From<Partitions> for State {
    fn from(partitions: Partitions) -> Self {
        dfn_core::api::print("state::from<Partitions>: ()");
        let schema = partitions.schema_label();
        dfn_core::api::print(format!("state::from<Partitions>: from_schema: {schema:#?}"));
        match schema {
            // We have managed memory, but were unable to read the schema label.  This is a bug.
            None => {
                trap_with("Decoding stable memory failed: Failed to get schema label."); // TODO: Provide first bytes of the metadata memory.
                unreachable!()
            }
            // The schema claims to read from raw memory, but we got the label from amnaged mamory.  This is a bug.
            Some(SchemaLabel::Map) => {
                trap_with(
                    "Decoding stable memory failed: Found label 'Map' in managed memory, but these are incompatible.",
                );
                unreachable!()
            }
            // Accounts are in stable structures in one partition, the rest of the heap is serialized as candid in another partition.
            Some(SchemaLabel::AccountsInStableMemory) => {
                Self::recover_heap_from_managed_memory(partitions.get(Partitions::HEAP_MEMORY_ID))
            }
        }
    }
}

/// Loads state from stable memory.
impl From<DefaultMemoryImpl> for State {
    fn from(memory: DefaultMemoryImpl) -> Self {
        dfn_core::api::print("START state::from<DefaultMemoryImpl>: ())");
        match Partitions::try_from_memory(memory) {
            Ok(partitions) => Self::from(partitions),
            Err(_memory) => Self::recover_from_raw_memory(),
        }
    }
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
    /// The schema version, as stored in an arbitrary memory.
    #[cfg(test)]
    fn schema_version_from_memory<M>(memory: &M) -> Option<SchemaLabel>
    where
        M: Memory,
    {
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        memory.read(0, &mut schema_label_bytes);
        SchemaLabel::try_from(&schema_label_bytes[..]).ok()
    }

    /// Save any unsaved state to stable memory.
    pub fn pre_upgrade(&self) {
        let schema = self.accounts_store.borrow().schema_label();
        match schema {
            SchemaLabel::Map => self.save_to_raw_memory(),
            SchemaLabel::AccountsInStableMemory => self.save_heap_to_managed_memory(DefaultMemoryImpl::default()), // TODO: Better naming for this.  save_heap_to_managed_memory()? TODO: Don't get managed memory afresh - get it from inside the state.
        }
    }
}
