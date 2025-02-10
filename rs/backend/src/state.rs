pub mod partitions;
#[cfg(test)]
pub mod tests;

use self::partitions::Partitions;
use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use crate::tvl::state::TvlState;

use dfn_candid::Candid;
use ic_cdk::api::trap;
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
            tvl_state,
        } = self;
        writeln!(f, "State {{")?;
        writeln!(f, "  accounts: {accounts_store:?}")?;
        writeln!(f, "  assets: <html etc> (elided)")?;
        writeln!(f, "  asset_hashes: <hashes of the assets> (elided)")?;
        writeln!(f, "  performance: <stats for the metrics endpoint> (elided)")?;
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
    static PARTITIONS: RefCell<Partitions> = RefCell::new(Partitions::from(DefaultMemoryImpl::default()));
}

/// Initializes the state when the canister is initialized.
pub fn init_state() {
    STATE.set(Some(State::new()));
}

/// Initializes the state when the canister is upgraded.
pub fn restore_state() {
    STATE.set(Some(State::new_restored()));
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

/// An accessor for the partitions.
pub fn with_partitions<R>(f: impl FnOnce(&Partitions) -> R) -> R {
    PARTITIONS.with_borrow(|p| f(p))
}

/// Resets the stable memory partitions. This is only used in tests where the `Partitions` is not
/// treated as a global variable, and usually it's only needed for `proptest!`.
#[cfg(test)]
pub fn reset_partitions() {
    PARTITIONS.replace(Partitions::from(DefaultMemoryImpl::default()));
}

#[allow(clippy::new_without_default)]
impl State {
    /// Creates new state. Should be called in `init`.
    #[must_use]
    pub fn new() -> Self {
        State {
            accounts_store: AccountsStore::new(),
            assets: Assets::default(),
            asset_hashes: AssetHashes::default(),
            performance: PerformanceCounts::default(),
            tvl_state: TvlState::default(),
        }
    }

    /// Recovers the state from stable memory. Should be called in `post_upgrade`.
    #[must_use]
    pub fn new_restored() -> Self {
        println!("START state::new_restored: ())");
        let bytes = with_partitions(Partitions::read_bytes_from_managed_memory);
        let state =
            State::decode(bytes).unwrap_or_else(|e| trap(&format!("Decoding stable memory failed. Error: {e:?}")));
        println!("END   state::new_restored: ()");
        state
    }

    /// Saves the state to stable memory. Should be called in `pre_upgrade`.
    pub fn save(&self) {
        println!("START state::save_heap: ()");
        let bytes = self.encode();
        with_partitions(|p| p.write_bytes_to_managed_memory(&bytes));
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
            tvl_state,
        })
    }
}
