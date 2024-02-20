pub mod partitions;
#[cfg(test)]
pub mod tests;
mod with_accounts_in_stable_memory;
mod with_raw_memory;

use self::partitions::PartitionsMaybe;
use self::partitions::{PartitionType, Partitions};
use crate::accounts_store::schema::accounts_in_unbounded_stable_btree_map::AccountsDbAsUnboundedStableBTreeMap;
use crate::accounts_store::schema::proxy::AccountsDb;
use crate::accounts_store::schema::AccountsDbTrait;
use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::AccountsStore;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;

use dfn_candid::Candid;
use dfn_core::api::trap_with;
use ic_cdk::println;
use ic_stable_structures::{DefaultMemoryImpl, Memory};
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
    /// Gets the authoritative schema.  This is the schema that is in stable memory.
    pub fn schema_label(&self) -> SchemaLabel {
        match &*self.partitions_maybe.borrow() {
            PartitionsMaybe::Partitions(partitions) => partitions.schema_label(),
            PartitionsMaybe::None(_memory) => SchemaLabel::Map,
        }
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
    #[cfg(test)]
    pub fn new(schema: SchemaLabel, memory: DefaultMemoryImpl) -> Self {
        match schema {
            SchemaLabel::Map => {
                println!("New State: Map");
                State {
                    accounts_store: RefCell::new(AccountsStore::default()),
                    assets: RefCell::new(Assets::default()),
                    asset_hashes: RefCell::new(AssetHashes::default()),
                    performance: RefCell::new(PerformanceCounts::default()),
                    partitions_maybe: RefCell::new(PartitionsMaybe::None(memory)),
                }
            }
            SchemaLabel::AccountsInStableMemory => {
                println!("New State: AccountsInStableMemory");
                let partitions = Partitions::new_with_schema(memory, schema);
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
    }
}

/// Restores state from managed memory.
impl From<Partitions> for State {
    fn from(partitions: Partitions) -> Self {
        println!("START state::from<Partitions>: ()");
        let schema = partitions.schema_label();
        println!("      state::from<Partitions>: from_schema: {schema:#?}");
        let state = match schema {
            // The schema claims to read from raw memory, but we got the label from managed memory.  This is a bug.
            SchemaLabel::Map => {
                trap_with(
                    "Decoding stable memory failed: Found label 'Map' in managed memory, but these are incompatible.",
                );
                unreachable!()
            }
            // Accounts are in stable structures in one partition, the rest of the heap is serialized as candid in another partition.
            SchemaLabel::AccountsInStableMemory => {
                let state = Self::recover_heap_from_managed_memory(&partitions.get(PartitionType::Heap.memory_id()));
                let accounts_db = AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::load(
                    partitions.get(PartitionType::Accounts.memory_id()),
                ));
                // Replace the default accountsdb created by `serde`` with the one from stable memory.
                let _deserialized_accounts_db = state.accounts_store.borrow_mut().replace_accounts_db(accounts_db);
                state.partitions_maybe.replace(PartitionsMaybe::Partitions(partitions));
                state
            }
        };
        println!("END   state::from<Partitions>: ()");
        state
    }
}

/// Restores state from stable memory.
impl From<DefaultMemoryImpl> for State {
    fn from(memory: DefaultMemoryImpl) -> Self {
        println!("START state::from<DefaultMemoryImpl>: ())");
        let state = match Partitions::try_from_memory(memory) {
            Ok(partitions) => Self::from(partitions),
            Err(_memory) => Self::recover_from_raw_memory(),
        };
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

    /// Creates the state from stable memory in the `post_upgrade()` hook.
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
    #[must_use]
    pub fn restore() -> Self {
        match Self::schema_version_from_stable_memory() {
            None => Self::recover_from_raw_memory(),
            Some(version) => {
                trap_with(&format!("Unknown schema version: {version:?}"));
                unreachable!();
            }
        }
    }
    /// Saves any unsaved state to stable memory.
    pub fn save(&self) {
        let schema = self.schema_label();
        println!(
            "START State save: {:?} (accounts: {:?})",
            &schema,
            self.accounts_store.borrow().schema_label()
        );
        match schema {
            // Note: For 'Map', data is saved to raw stable memory using the original API
            //       that does not take a memory as an argument but rather gets
            //       the default memory implementation from the global context and
            //       writes to that.  This API is impossible to test outside a canister
            //       and should be deprecated as soon as possible.
            // Note: The 'Map' schema stores all the data on the heap and, before upgrade,
            //       all the data is saved directly to the heap.  As the number of accounts
            //       has grown, this saving and later restoring has become seriously slow.
            SchemaLabel::Map => self.save_to_raw_memory(),
            // Note: In the `AccountsInStableMemory` schema, accounts are stored in a managed
            //       stable virtual memory, so they do not need to be serialized and restored on
            //       canister upgrade.  However other data _is_ still stored on the heap and this
            //       other data must be saved in the pre-upgrade hook to a different managed
            //       stable virtual memory and restored after upgrade.
            SchemaLabel::AccountsInStableMemory => self.save_heap_to_managed_memory(),
        }
    }
}
