use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use dfn_candid::Candid;
use dfn_core::{api::trap_with, stable};
use ic_stable_structures::memory_manager::MemoryManager;
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

/// Memory layout consisting of a memory manager and some virtual memory.
struct Partitions {
    pub memory_manager: MemoryManager<DefaultMemoryImpl>,
}
impl Partitions {
    fn is_managed(memory: &DefaultMemoryImpl) -> bool {
        let memory_pages = memory.size();
        if memory_pages == 0 {
            return false;
        }
        // TODO: This is private in ic-stable-structures.  We should make it public, or have a public method for determining whether there is a memory manager at a given offset.
        const MEMORY_MANAGER_MAGIC_BYTES: &[u8; 3] = b"MGR"; // From the spec: https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/memory_manager/struct.MemoryManager.html#v1-layout
        let mut actual_first_bytes = [0u8; MEMORY_MANAGER_MAGIC_BYTES.len()];
        memory.read(0, &mut actual_first_bytes);
        actual_first_bytes == *MEMORY_MANAGER_MAGIC_BYTES
    }
    pub fn init(memory: DefaultMemoryImpl) -> Self {
        let memory_manager = MemoryManager::init(memory);
        Partitions { memory_manager }
    }
    /// Gets an existing memory manager, if there is one.  If not, returns the unmodified memory.
    pub fn from(memory: DefaultMemoryImpl) -> Result<Self, DefaultMemoryImpl> {
        if Self::is_managed(&memory) {
            Ok(Self::init(memory))
        } else {
            Err(memory)
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
    /// The schema version, determined by the last version that was saved to stable memory.
    fn schema_version_from_stable_memory() -> Option<SchemaLabel> {
        // TODO: Check whether there is a memorymanger at the root.  If so, get the schema from virtual memory.
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
        if current_schema == desired_schema {
            dfn_core::api::print(format!("Loading State: Requested to keep data as {current_schema:?}."));
        } else {
            dfn_core::api::print(format!(
                "Loading State: Requested migration from {current_schema:?} to {desired_schema:?}."
            ));
        }
        dfn_core::api::print(format!("Loading State: Unsupported migration from {current_schema:?} to {desired_schema:?}.  Keeping data in the existing form."));
        match (current_schema, desired_schema) {
            (SchemaLabel::Map, SchemaLabel::Map) => Self::recover_state_from_map(),
            (SchemaLabel::Map, SchemaLabel::AccountsInStableMemory) => {
                dfn_core::api::print(format!("Loading State: Unsupported migration from {current_schema:?} to {desired_schema:?}.  Keeping data in the existing form."));
                Self::recover_state_from_map()
            }
            (SchemaLabel::AccountsInStableMemory, SchemaLabel::AccountsInStableMemory) => {
                accounts_in_stable_memory::recover_from_stable_memory()
            }
            (SchemaLabel::AccountsInStableMemory, _) => {
                trap_with(&format!(
                    "Loading State: Unsupported migration from {current_schema:?} to {desired_schema:?}.  Bailing out..."
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

// State from/to the `SchemaLabel::AccountsInStableMemory` format.
mod accounts_in_stable_memory {
    use super::{trap_with, StableState, State};
    use ic_stable_structures::{
        memory_manager::{MemoryId, MemoryManager},
        DefaultMemoryImpl, Memory,
    };

    /// Save any unsaved state to stable memory in the `SchemaLabel::AccountsInStableMemory` format.
    pub fn save_in_stable_memory(state: &State) {
        let bytes = state.encode(); // TODO: Test that this excludes the accounts data.
        let length_field = u64::try_from(bytes.len())
            .unwrap_or_else(|e| {
                trap_with(&format!(
                    "The serialized memory takes more than 2**64 bytes.  Amazing: {e:?}"
                ));
                unreachable!();
            })
            .to_be_bytes();
        let heap_memory = get_heap_memory();
        heap_memory.write(0, &length_field);
        heap_memory.write(8, &bytes); // TODO: Prefix with size of memory.
    }
    /// Create the state from stable memory in the `SchemaLabel::AccountsInStableMemory` format.
    pub fn recover_from_stable_memory() -> State {
        let memory = get_heap_memory();
        let candid_len = {
            let mut length_field = [0u8; 8];
            memory.read(0, &mut length_field);
            u64::from_be_bytes(length_field) as usize
        };
        let candid_bytes = vec![0u8; candid_len];
        State::decode(candid_bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
            unreachable!();
        })
    }
    /// Gets the stable memory partition for saving the heap.
    fn get_heap_memory() -> impl Memory {
        let mem_mgr = MemoryManager::init(DefaultMemoryImpl::default());
        mem_mgr.get(MemoryId::new(1)) // TODO: Define a const for the heap memory ID.
    }
}
