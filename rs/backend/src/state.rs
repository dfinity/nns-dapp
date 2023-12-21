use crate::accounts_store::schema::accounts_in_unbounded_stable_btree_map::AccountsDbAsUnboundedStableBTreeMap;
use crate::accounts_store::schema::map::AccountsDbAsMap;
use crate::accounts_store::schema::proxy::AccountsDb;
use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::AccountsStore;
use crate::arguments::CanisterArguments;
use crate::arguments::CANISTER_ARGUMENTS;
use crate::assets::AssetHashes;
use crate::assets::Assets;
use crate::perf::PerformanceCounts;
use core::cell::RefCell;
use dfn_candid::Candid;
use dfn_core::api::trap_with;
use ic_cdk::println;
use ic_stable_structures::DefaultMemoryImpl;
use on_wire::{FromWire, IntoWire};
use partitions::Partitions;

pub mod partitions;
#[cfg(test)]
pub mod tests;

pub mod with_accounts_in_stable_memory;
pub mod with_raw_memory;

pub struct State {
    // NOTE: When adding new persistent fields here, ensure that these fields
    // are being persisted in the `replace` method below.
    pub accounts_store: RefCell<AccountsStore>,
    pub assets: RefCell<Assets>,
    pub asset_hashes: RefCell<AssetHashes>,
    pub performance: RefCell<PerformanceCounts>,
    pub partitions_maybe: RefCell<Result<Partitions, DefaultMemoryImpl>>,
}

#[cfg(test)]
impl PartialEq for State {
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
            partitions_maybe: RefCell::new(Err(DefaultMemoryImpl::default())),
        }
    }
}

impl core::fmt::Debug for State {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "State {{")?;
        writeln!(f, "  state_schema: {:?}", &self.schema_label())?;
        writeln!(f, "  accounts: {:?}", &self.accounts_store.borrow())?;
        writeln!(
            f,
            "  args_schema: {:?}",
            &CANISTER_ARGUMENTS.with(|args| args.borrow().schema)
        )?;
        writeln!(f, "  partitioned: {:?}", self.partitions_maybe.borrow().is_ok())?;
        writeln!(f, "  accounts_store: ...")?;
        writeln!(f, "}}")
    }
}

impl State {
    pub fn replace(&self, new_state: State) {
        println!("Replacing state:\n {self:?}\nwith:\n{new_state:?}");
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
        self.partitions_maybe
            .replace(partitions_maybe)
            .map(|_| ())
            .unwrap_or_default();
        println!("Replace state complete:\n {self:?}");
    }
    /// Gets the authoritative schema.  This is the schema that is in stable memory.
    pub fn schema_label(&self) -> SchemaLabel {
        match self.partitions_maybe.borrow().as_ref() {
            Ok(partitions) => {
                println!(
                    "State: schema_label for managed memory: {:?}",
                    partitions.schema_label()
                );
                partitions.schema_label()
            }
            Err(_memory) => {
                println!("State: schema_label for raw memory is: Map");
                SchemaLabel::Map
            }
        }
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
    pub fn new(schema: SchemaLabel, memory: DefaultMemoryImpl) -> Self {
        let state = match schema {
            SchemaLabel::Map => {
                println!("New State: Map");
                State {
                    accounts_store: RefCell::new(AccountsStore::default()),
                    assets: RefCell::new(Assets::default()),
                    asset_hashes: RefCell::new(AssetHashes::default()),
                    performance: RefCell::new(PerformanceCounts::default()),
                    partitions_maybe: RefCell::new(Err(memory)),
                }
            }
            SchemaLabel::AccountsInStableMemory => {
                println!("New State: AccountsInStableMemory");
                let partitions = Partitions::new_for_schema(memory, schema);
                let accounts_store =
                    AccountsStore::new_with_unbounded_stable_btree_map(partitions.get(Partitions::ACCOUNTS_MEMORY_ID));
                State {
                    accounts_store: RefCell::new(accounts_store),
                    assets: RefCell::new(Assets::default()),
                    asset_hashes: RefCell::new(AssetHashes::default()),
                    performance: RefCell::new(PerformanceCounts::default()),
                    partitions_maybe: RefCell::new(Ok(partitions)),
                }
            }
        };
        assert_eq!(
            state.accounts_store.borrow().schema_label(),
            schema,
            "Accounts store does not have the expected schema"
        );
        assert_eq!(
            state
                .partitions_maybe
                .borrow()
                .as_ref()
                .map(|partitions| partitions.schema_label())
                .unwrap_or_default(),
            schema,
            "Memory is not partitioned as expected"
        ); // TODO: Better assertion
        state
    }
    /// Applies the specified arguments to the state.
    pub fn with_arguments(mut self, arguments: &CanisterArguments) -> Self {
        // TODO: If a migration is needed, kick it off.
        // TODO: Initialize assets and asset_hashes
        if let Some(schema) = arguments.schema {
            self.start_migration_to(schema);
        }
        self
    }
    /// Applies the specified arguments, if provided
    pub fn with_arguments_maybe(self, arguments_maybe: Option<&CanisterArguments>) -> Self {
        match arguments_maybe {
            Some(arguments) => self.with_arguments(arguments),
            None => self,
        }
    }
    /// Starts a migration, if needed.
    pub fn start_migration_to(&mut self, schema: SchemaLabel) {
        let schema_now = self.schema_label();
        if schema_now == schema {
            println!("start_migration_to: No migration needed.  Schema is already {schema:?}.");
        } else {
            let new_accounts_db = match schema {
                SchemaLabel::Map => AccountsDb::Map(AccountsDbAsMap::default()),
                SchemaLabel::AccountsInStableMemory => {
                    // If the memory isn't partitioned, partition it now.
                    if let Err(memory) = self.partitions_maybe.borrow().as_ref() {
                        let partitions = Partitions::new_for_schema(Partitions::copy_memory_reference(memory), schema);
                        self.partitions_maybe
                            .replace(Ok(partitions))
                            .map(|_| ())
                            .unwrap_or_default();
                    }
                    let vm = self
                        .partitions_maybe
                        .borrow()
                        .as_ref()
                        .map_err(|_| "foo")
                        .unwrap()
                        .get(Partitions::ACCOUNTS_MEMORY_ID);
                    AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::new(vm))
                }
            };
            self.accounts_store
                .borrow_mut()
                .start_migrating_accounts_to(new_accounts_db);
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
        println!("state::from<Partitions>: ()");
        let schema = partitions.schema_label();
        println!("state::from<Partitions>: from_schema: {schema:#?}");
        match schema {
            // The schema claims to read from raw memory, but we got the label from amnaged memory.  This is a bug.
            SchemaLabel::Map => {
                trap_with(
                    "Decoding stable memory failed: Found label 'Map' in managed memory, but these are incompatible.",
                );
                unreachable!()
            }
            // Accounts are in stable structures in one partition, the rest of the heap is serialized as candid in another partition.
            SchemaLabel::AccountsInStableMemory => {
                let state = Self::recover_heap_from_managed_memory(partitions.get(Partitions::HEAP_MEMORY_ID));
                state
                    .accounts_store
                    .borrow_mut()
                    .load_unbounded_stable_btree_map(partitions.get(Partitions::ACCOUNTS_MEMORY_ID));
                state
                    .partitions_maybe
                    .replace(Ok(partitions))
                    .map(|_| ())
                    .unwrap_or_default();
                state
            }
        }
    }
}

/// Loads state from stable memory.
impl From<DefaultMemoryImpl> for State {
    fn from(memory: DefaultMemoryImpl) -> Self {
        println!("START state::from<DefaultMemoryImpl>: ())");
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
            partitions_maybe: RefCell::new(Err(DefaultMemoryImpl::default())),
        })
    }
}

// Methods called on pre_upgrade.
impl State {
    /// Save any unsaved state to stable memory.
    pub fn pre_upgrade(&self) {
        let schema = self.schema_label();
        println!(
            "START State pre_upgrade from: {:?} (accounts: {:?})",
            &schema,
            self.accounts_store.borrow().schema_label()
        );
        match schema {
            SchemaLabel::Map => self.save_to_raw_memory(),
            SchemaLabel::AccountsInStableMemory => self.save_heap_to_managed_memory(), // TODO: Better naming for this.  save_heap_to_managed_memory()? TODO: Don't get managed memory afresh - get it from inside the state.
        }
    }
}
