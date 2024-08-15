pub mod partitions;
#[cfg(test)]
pub mod tests;
mod with_accounts_in_stable_memory;

use self::partitions::{PartitionType, Partitions, PartitionsMaybe};
use crate::accounts_store::schema::accounts_in_unbounded_stable_btree_map::AccountsDbAsUnboundedStableBTreeMap;
use crate::accounts_store::schema::proxy::AccountsDb;
use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;

use dfn_candid::Candid;
use ic_cdk::println;
use ic_stable_structures::DefaultMemoryImpl;
use on_wire::{FromWire, IntoWire};
use std::cell::RefCell;

pub struct State {
    // NOTE: When adding new persistent fields here, ensure that these fields
    // are being persisted in the `replace` method below.
    pub accounts_store: RefCell<AccountsStore>,
    pub assets: RefCell<Assets>,
    pub asset_hashes: RefCell<AssetHashes>,
    pub performance: RefCell<PerformanceCounts>,
    pub partitions_maybe: RefCell<PartitionsMaybe>,
}

#[cfg(test)]
impl PartialEq for State {
    /// Compares essential content of two states for equality.
    fn eq(&self, other: &Self) -> bool {
        (self.accounts_store == other.accounts_store)
            && (self.assets == other.assets)
            && (self.asset_hashes == other.asset_hashes)
            && (self.performance == other.performance)
    }
}
#[cfg(test)]
impl Eq for State {}

impl Default for State {
    fn default() -> Self {
        Self {
            accounts_store: RefCell::new(AccountsStore::default()),
            assets: RefCell::new(Assets::default()),
            asset_hashes: RefCell::new(AssetHashes::default()),
            performance: RefCell::new(PerformanceCounts::default()),
            partitions_maybe: RefCell::new(PartitionsMaybe::None(DefaultMemoryImpl::default())),
        }
    }
}

impl core::fmt::Debug for State {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Destructure to ensure that we don't forget to update this when new fields are added:
        let State {
            accounts_store,
            assets: _,
            asset_hashes: _,
            performance: _,
            partitions_maybe,
        } = self;
        writeln!(f, "State {{")?;
        writeln!(f, "  accounts: {:?}", accounts_store.borrow())?;
        writeln!(f, "  assets: <html etc> (elided)")?;
        writeln!(f, "  asset_hashes: <hashes of the assets> (elided)")?;
        writeln!(f, "  performance: <stats for the metrics endpoint> (elided)")?;
        writeln!(f, "  partitions_maybe: {:?}", partitions_maybe.borrow())?;
        writeln!(f, "}}")
    }
}

impl State {
    pub fn replace(&self, new_state: State) {
        let State {
            accounts_store,
            assets,
            asset_hashes,
            performance,
            partitions_maybe,
        } = new_state;
        let partitions_maybe = partitions_maybe.into_inner();
        self.accounts_store.replace(accounts_store.into_inner());
        self.assets.replace(assets.into_inner());
        self.asset_hashes.replace(asset_hashes.into_inner());
        self.performance.replace(performance.into_inner());
        self.partitions_maybe.replace(partitions_maybe);
    }
}

pub trait StableState: Sized {
    fn encode(&self) -> Vec<u8>;
    fn decode(bytes: Vec<u8>) -> Result<Self, String>;
}

thread_local! {
    pub static STATE: State = State::default();
}

impl State {
    /// Creates new state with the specified schema.
    #[must_use]
    pub fn new(memory: DefaultMemoryImpl) -> Self {
        let partitions = Partitions::new(memory);
        let accounts_store = AccountsStore::from(AccountsDb::UnboundedStableBTreeMap(
            AccountsDbAsUnboundedStableBTreeMap::new(partitions.get(PartitionType::Accounts.memory_id())),
        ));
        State {
            accounts_store: RefCell::new(accounts_store),
            assets: RefCell::new(Assets::default()),
            asset_hashes: RefCell::new(AssetHashes::default()),
            performance: RefCell::new(PerformanceCounts::default()),
            partitions_maybe: RefCell::new(PartitionsMaybe::Partitions(partitions)),
        }
    }
}

/// Restores state from managed memory.
impl From<Partitions> for State {
    fn from(partitions: Partitions) -> Self {
        println!("START state::from<Partitions>: ()");
        let state = Self::recover_heap_from_managed_memory(&partitions.get(PartitionType::Heap.memory_id()));
        let accounts_db = AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::load(
            partitions.get(PartitionType::Accounts.memory_id()),
        ));
        // Replace the default accountsdb created by `serde`` with the one from stable memory.
        let _deserialized_accounts_db = state.accounts_store.borrow_mut().replace_accounts_db(accounts_db);
        state.partitions_maybe.replace(PartitionsMaybe::Partitions(partitions));
        state
    }
}

/// Restores state from stable memory.
impl From<DefaultMemoryImpl> for State {
    fn from(memory: DefaultMemoryImpl) -> Self {
        println!("START state::from<DefaultMemoryImpl>: ())");
        let partitions = Partitions::from(memory);
        let state = Self::from(partitions);
        println!("END   state::from<DefaultMemoryImpl>: ()");
        state
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
            partitions_maybe: RefCell::new(PartitionsMaybe::None(DefaultMemoryImpl::default())),
        })
    }
}

// Methods called on pre_upgrade and post_upgrade.
impl State {
    /// Saves any unsaved state to stable memory.
    pub fn save(&self) {
        self.save_heap_to_managed_memory();
    }
}
