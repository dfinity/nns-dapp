use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use dfn_candid::Candid;
use dfn_core::{api::trap_with, stable};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, Memory, RestrictedMemory, StableBTreeMap,
};
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

// Stable memory is split into several virtual memories for different purposes.
#[allow(dead_code)]
type DefaultVirtualMemory = VirtualMemory<DefaultMemoryImpl>;
#[allow(dead_code)]
const CONTROL_MEMORY_ID: MemoryId = MemoryId::new(0);
#[allow(dead_code)]
const HEAP_MEMORY_ID: MemoryId = MemoryId::new(1);
#[allow(dead_code)]
const ACCOUNTS_DATA_MEMORY_ID_SCHEMA_A: MemoryId = MemoryId::new(2);
#[allow(dead_code)]
const ACCOUNTS_DATA_MEMORY_ID_SCHEMA_B: MemoryId = MemoryId::new(3);
// NOTE: we allocate the first 1 page (64KiB) of the
// canister memory for the memory layout version information.
#[allow(dead_code)]
const METADATA_PAGES: u64 = 1;

#[allow(dead_code)]
type RM = RestrictedMemory<DefaultMemoryImpl>;
#[allow(dead_code)]
type VM = VirtualMemory<RM>;

thread_local! {
    pub static STATE: State = State::default();

    static METADATA_MEMORY: RefCell<RM> = RefCell::new(RM::new(DefaultMemoryImpl::default(), 0..METADATA_PAGES));

    /// The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    /// return a memory that can be used by stable structures.
    ///
    /// Note: The memory manager exists only in versioned canisters.
    /// TODO: Remove the Option when the canister is versioned.
    static MEMORY_MANAGER: RefCell<Option<MemoryManager<RM>>> = RefCell::new(None);

    // Initialize a `StableBTreeMap` that holds the accounts data.
    // TODO: Change the key to a struct consisting of pagenum, principal length and a byte vec.
    // TODO: Change the value to a 1kb page; u16len+data; use -1 if the page is full and there is a follow-on page.
    #[allow(clippy::type_complexity)] // TODO: Remove once the Option is removed.
    static ACCOUNTS_MEMORY_A: RefCell<Option<StableBTreeMap<[u8;32], [u8;1024], DefaultVirtualMemory>>> = RefCell::new(None);
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
    /// - The previous schema, when first migrating from the previous schema to the current schema.
    /// - The curent schema, if upgrading without changing the schema.
    /// - The next schema, if a new schema was deployed and we need to roll back.
    ///
    /// Note: Changing the schema requires at least two deployments:
    /// - Deploy a relase with a parser for the new schema.
    /// - Then, deploy a release that writes the new schema.
    /// This way it is possible to roll back after deploying the new schema.
    pub fn post_upgrade() -> Self {
        match Self::schema_version_from_stable_memory() {
            None => Self::post_upgrade_unversioned(),
            Some(version) => {
                trap_with(&format!("Unknown schema version: {version}"));
                unreachable!();
            }
        }
    }
    /// Save any unsaved state to stable memory.
    pub fn pre_upgrade(&self) {
        self.pre_upgrade_unversioned()
    }
}

// The unversioned schema.
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

// The S0 schema.
// * S0 stores accounts in a BTreeMap.
impl State {
    /// Migrate from unversioned.
    #[allow(dead_code)]
    fn migrate_from_unversioned() {
        // TODO: Do in multiple steps.
        unimplemented!()
        // TODO: when done, flip the version.
    }
    /// Create the state from stable memory in the post_upgrade() hook.
    #[allow(dead_code)]
    fn post_upgrade_s0_early() -> Self {
        // TODO: Determine the format of the stable memory.
        // Assuming it is unversioned:
        Self::post_upgrade_unversioned()
    }
    /// Save any unsaved state to stable memory in the V0 format, if
    /// the migration to S0 has succeeded, else as unversioned.
    #[allow(dead_code)]
    fn pre_upgrade_s0_early() {
        // TODO: Determine whether the migration has suceeded.
    }
    /// Save any unsaved state to stable memory in the V0 format.
    ///
    /// Precondition: The memory manager exists.
    #[allow(dead_code)]
    fn pre_upgrade_s0(&self, memory_manager: &mut MemoryManager<RM>) {
        let heap_memory = memory_manager.get(HEAP_MEMORY_ID);
        let self_bytes = self.encode();
        let self_bytes_len = self_bytes.len() as u64;
        const AB_HEADER_BOOTABLE_OFFSET: u64 = 0;
        const AB_HEADER_BOOTABLE_LEN: u64 = 1;
        const AB_HEADER_BOOTABLE_TRUE: [u8; 1] = [0x5a];
        const AB_HEADER_BOOTABLE_FALSE: [u8; 1] = [0x00];
        const AB_HEADER_PAYLOAD_LEN_OFFSET: u64 = AB_HEADER_BOOTABLE_OFFSET + AB_HEADER_BOOTABLE_LEN;
        const AB_HEADER_PAYLOAD_LEN_LEN: u64 = 8;
        const AB_PAYLOAD_OFFSET: u64 = AB_HEADER_PAYLOAD_LEN_OFFSET + AB_HEADER_PAYLOAD_LEN_LEN;
        // Mark the memory as invalid.
        heap_memory.write(AB_HEADER_BOOTABLE_OFFSET, &AB_HEADER_BOOTABLE_FALSE);
        // Populate the memory.
        heap_memory.write(AB_HEADER_PAYLOAD_LEN_OFFSET, &self_bytes_len.to_le_bytes());
        heap_memory.write(AB_PAYLOAD_OFFSET, &self_bytes);
        // Mark the memory as valid.
        heap_memory.write(AB_HEADER_BOOTABLE_OFFSET, &AB_HEADER_BOOTABLE_TRUE);
    }
}
