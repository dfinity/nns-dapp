//! Data storage schema `AccountsInStableMemory`: Accounts data is stored in a `StableBTreeMap`,
//! other data is on the heap and serialized in `pre_upgrade` hooks.
//!
//! Data is stored in a [`ic_stable_structures::btreemap::BTreeMap`](https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/btreemap/struct.BTreeMap.html)
//! with values that are [`ic_stable_structures::storable::Bound::Unbounded`](https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/storable/enum.Bound.html#variant.Unbounded)
//! as described on the [dfinity forum](https://forum.dfinity.org/t/stable-structures-removing-the-bounded-size-requirement/21167).

use super::{Account, AccountsDbTrait, SchemaLabel};
use ic_stable_structures::{btreemap::BTreeMap as StableBTreeMap, memory_manager::VirtualMemory, DefaultMemoryImpl};
use std::fmt;

// TODO: Implement Eq and PartialEq for ic_stable_structures::btreemap::BTreeMap, as this makes testing easier.  It is unlikely that Eq will be used on any large data dataset.
pub struct AccountsDbAsUnboundedStableBTreeMap {
    accounts: StableBTreeMap<Vec<u8>, Account, VirtualMemory<DefaultMemoryImpl>>,
}

impl AccountsDbAsUnboundedStableBTreeMap {
    /// Creates a new, empty database.
    pub fn new(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        Self {
            accounts: StableBTreeMap::new(memory),
        }
    }
    /// Loads a database.
    pub fn load(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        Self {
            accounts: StableBTreeMap::load(memory),
        }
    }
}

impl AccountsDbTrait for AccountsDbAsUnboundedStableBTreeMap {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.accounts.insert(account_key.to_vec(), account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.accounts.contains_key(&account_key.to_vec())
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.accounts.get(&account_key.to_vec()) // TODO: Change the trait to &Vec.
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.accounts.remove(&account_key.to_vec());
    }
    fn db_accounts_len(&self) -> u64 {
        self.accounts.len() as u64
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        let iterator = self.accounts.iter().map(|(_key, value)| value);
        Box::new(iterator)
    }
    fn schema_label(&self) -> SchemaLabel {
        SchemaLabel::Map
    }
}

impl fmt::Debug for AccountsDbAsUnboundedStableBTreeMap {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        write!(
            f,
            "AccountsDbAsUnboundedStableBTreeMap {{ accounts: StableBTreeMap{{.. {} entries}} }}",
            self.accounts.len()
        )
    }
}
