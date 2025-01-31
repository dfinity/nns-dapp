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
use crate::tvl::state::TvlState;

use dfn_candid::Candid;
use ic_cdk::println;
use ic_stable_structures::DefaultMemoryImpl;
use on_wire::{FromWire, IntoWire};
use std::cell::RefCell;

pub struct State {
    // NOTE: When adding new persistent fields here, ensure that these fields
    // are being persisted in the `replace` method below.
    pub accounts_store: AccountsStore,
    pub assets: Assets,
    pub asset_hashes: AssetHashes,
    pub performance: PerformanceCounts,
    pub partitions_maybe: PartitionsMaybe,
    pub tvl_state: TvlState,
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

impl core::fmt::Debug for State {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Destructure to ensure that we don't forget to update this when new fields are added:
        let State {
            accounts_store,
            assets: _,
            asset_hashes: _,
            performance: _,
            partitions_maybe,
            tvl_state,
        } = self;
        writeln!(f, "State {{")?;
        writeln!(f, "  accounts: {accounts_store:?}")?;
        writeln!(f, "  assets: <html etc> (elided)")?;
        writeln!(f, "  asset_hashes: <hashes of the assets> (elided)")?;
        writeln!(f, "  performance: <stats for the metrics endpoint> (elided)")?;
        writeln!(f, "  partitions_maybe: {partitions_maybe:?}")?;
        writeln!(f, "  tvl_state: {tvl_state:?}")?;
        writeln!(f, "}}")
    }
}

pub trait StableState: Sized {
    fn encode(&self) -> Vec<u8>;
    fn decode(bytes: Vec<u8>) -> Result<Self, String>;
}

thread_local! {
    static STATE: RefCell<Option<State>> = const { RefCell::new(None) };
}

/// Initializes the state when the canister is initialized.
pub fn init_state() {
    STATE.with_borrow_mut(|s| *s = Some(State::new(DefaultMemoryImpl::default())));
}

/// Initializes the state when the canister is upgraded.
pub fn restore_state() {
    STATE.with_borrow_mut(|s| *s = Some(State::new_restored(DefaultMemoryImpl::default())));
}

/// Saves the state to stable memory.
///
/// # Panics
/// Panics when the function is called before the `init_state` or `restore_state` is called.
pub fn save_state() {
    STATE.with_borrow(|s| s.as_ref().expect("State not initialized").save());
}

/// An accessor for the state.
///
/// # Panics
/// Panics when the function is called before the `init_state` or `restore_state` is called.
pub fn with_state<R>(f: impl FnOnce(&State) -> R) -> R {
    STATE.with_borrow(|s| f(s.as_ref().expect("State not initialized")))
}

/// A mutable accessor for the state.
///
/// # Panics
/// Panics when the function is called before the `init_state` or `restore_state` is called.
pub fn with_state_mut<R>(f: impl FnOnce(&mut State) -> R) -> R {
    STATE.with_borrow_mut(|s| f(s.as_mut().expect("State not initialized")))
}

impl State {
    /// Creates new state with the specified schema.
    #[must_use]
    pub fn new(memory: DefaultMemoryImpl) -> Self {
        let partitions = Partitions::from(memory);
        let accounts_store = AccountsStore::from(AccountsDb::UnboundedStableBTreeMap(
            AccountsDbAsUnboundedStableBTreeMap::new(partitions.get(PartitionType::Accounts.memory_id())),
        ));
        State {
            accounts_store,
            assets: Assets::default(),
            asset_hashes: AssetHashes::default(),
            performance: PerformanceCounts::default(),
            partitions_maybe: PartitionsMaybe::Partitions(partitions),
            tvl_state: TvlState::default(),
        }
    }

    #[must_use]
    pub fn new_restored(memory: DefaultMemoryImpl) -> Self {
        println!("START state::new_restored: ())");
        let partitions = Partitions::from(memory);
        let mut state = Self::recover_heap_from_managed_memory(&partitions);
        let accounts_db = AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::load(
            partitions.get(PartitionType::Accounts.memory_id()),
        ));
        // Replace the default accountsdb created by `serde` with the one from stable memory.
        let _deserialized_accounts_db = state.accounts_store.replace_accounts_db(accounts_db);
        state.partitions_maybe = PartitionsMaybe::Partitions(partitions);
        println!("END   state::new_restored: ()");
        state
    }
}

impl StableState for State {
    fn encode(&self) -> Vec<u8> {
        Candid((
            self.accounts_store.encode(),
            self.assets.encode(),
            self.tvl_state.encode(),
        ))
        .into_bytes()
        .unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let (account_store_bytes, assets_bytes, tvl_state_bytes) = Candid::from_bytes(bytes).map(|c| c.0)?;

        let assets = Assets::decode(assets_bytes)?;
        let asset_hashes = AssetHashes::from(&assets);
        let performance = PerformanceCounts::default();
        let tvl_state = TvlState::decode(tvl_state_bytes)?;

        Ok(State {
            accounts_store: AccountsStore::decode(account_store_bytes)?,
            assets,
            asset_hashes,
            performance,
            partitions_maybe: PartitionsMaybe::None(DefaultMemoryImpl::default()),
            tvl_state,
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
