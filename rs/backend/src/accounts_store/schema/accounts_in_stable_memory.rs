//! Data storage schema `S1`: Accounts data is stored in a `StableBTreeMap`,
//! other data is on the heap and serialized in `pre_upgrade` hooks.
//!
//! ## Pagination
//! Stable structures `BTreeMaps` currently support only fixed size data structures.  There are
//! "variable" sized structures but they are just fixed size data structures with a length field.
//!
//! Our largest accounts appear to consume about 4MiB of memory when serialized, or smallest well
//! under 1KiB.  Using fixed size structures large enough to accommodate the largest accounts
//! would be tremendously wasteful for the vast majority of small accounts.  So wasteful, that we
//! would not have nearly enough space to store all accounts.
//!
//! True variable size data structures may come at some time but until then, we need to work around this
//! limitation.  We do so by splitting the serialized data across fixed size pages and keying
//! the stable `BTree` with the account number and page number.  We look up page 0, if it is full, we
//! get page 1 as well and so on until we have the full serialization.
//!
//! Update: Unbounded stable structures are [in beta](https://docs.rs/ic-stable-structures/0.6.0-beta.1/ic_stable_structures/storable/enum.Bound.html#variant.Unbounded).
//! Throwing account data straight into a brand new data structure is perhaps unwise but we can
//! migrate once it is stable and well tested.
//!
//! ## Testing
//! The `StableBTreeMap` can be simulated with a normal `BTreeMap` with fixed size byte arrays as
//! values.

use crate::accounts_store::Account;
use dfn_candid::Candid;
use ic_stable_structures::storable::{BoundedStorable, Storable};
use on_wire::{FromWire, IntoWire};
use std::borrow::Cow;
use std::convert::TryInto;

#[cfg(test)]
mod mock;

pub trait AccountsInStableMemoryTrait {
    // TODO: Add a small cache to limit the cost of getting and parsing data to once per API call.

    /// Every account is serialized and stored in between `1` and `2**16-1` pages.
    const MAX_PAGES_PER_ACCOUNT: usize = u16::MAX as usize;

    // Low level methods to get and set pages.
    /// Gets a page of memory.
    fn s1_get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage>;

    /// Inserts a page of memory.
    ///
    /// # Returns
    /// - If the database did not have this key present, `None` is returned.
    /// - If the database did have this key present, the page is updated, and the old page is returned.
    fn s1_insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage>;

    /// Checks whether a page of memory exists.
    fn s1_contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool;

    /// Removes a page of memory.
    ///
    /// # Returns
    /// - The page that was removed from the database, if it was present, else `None`.
    fn s1_remove_account_page(&mut self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage>;

    /// Checks whether to get the next page.
    /// - If the very last page is full, getting the next page will return None. That is expected.
    fn s1_is_last_page(last_page_maybe: &Option<AccountStoragePage>) -> bool {
        if let Some(last_page) = last_page_maybe {
            // If the page is not full, there are no more pages.
            last_page.len() < AccountStoragePage::MAX_PAYLOAD_LEN
        } else {
            // We have already run out of pages.
            true
        }
    }

    // High level methods to get and set accounts.
    //
    // Note: These assist in implementing the AccountsDbTrait.

    /// Equivalent of [`super::AccountsDbTrait::db_get_account`].
    fn s1_get_account(&self, account_key: &[u8]) -> Option<Account> {
        let mut bytes = Vec::new();
        let mut have_account = false;
        for page_num in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(page_num as u16, account_key);
            if let Some(page) = self.s1_get_account_page(&account_storage_key) {
                have_account = true;
                let len = page.len();
                bytes.extend_from_slice(&page.bytes[AccountStoragePage::PAYLOAD_OFFSET..][..len]);
                if len < AccountStoragePage::MAX_PAYLOAD_LEN {
                    break;
                }
            } else {
                // The last page was full, or there were no pages.
                break;
            }
        }
        if have_account {
            let (account,) = Candid::from_bytes(bytes)
                .map(|c| c.0)
                .expect("Failed to parse account from store.");
            Some(account)
        } else {
            None
        }
    }

    /// Equivalent of [`super::AccountsDbTrait::db_insert_account`].
    fn s1_insert_account(&mut self, account_key: &[u8], account: Account) {
        // Serialize the account into one or more pages.
        let pages_to_insert = AccountStoragePage::pages_from_account(&account);
        if pages_to_insert.len() > Self::MAX_PAGES_PER_ACCOUNT {
            panic!(
                "Attempt to insert account with {} pages, which is more than the maximum of {} pages.",
                pages_to_insert.len(),
                Self::MAX_PAGES_PER_ACCOUNT
            );
        }
        // Insert the new pages, overwriting any existing data.  If previously there were more pages, delete the now unused pages.
        let mut last_removed_page = None; // Temporary store for pages that are replaced by new data.
        for index in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(index as u16, account_key);
            if let Some(page_to_insert) = pages_to_insert.get(index) {
                last_removed_page = self.s1_insert_account_page(account_storage_key, *page_to_insert);
            } else {
                // If the number of pages has reduced, we need to remove some pages.
                // ... If the last removed or replaced page was not full, we are done.
                if Self::s1_is_last_page(&last_removed_page) {
                    break;
                }
                last_removed_page = self.s1_remove_account_page(&account_storage_key);
            }
        }
    }

    /// Equivalent of [`super::AccountsDbTrait::db_contains_account`].
    fn s1_contains_account(&self, account_key: &[u8]) -> bool {
        let account_storage_key = AccountStorageKey::new(0, account_key);
        self.s1_contains_account_page(&account_storage_key)
    }

    /// Equivalent of [`super::AccountsDbTrait::db_remove_account`].
    fn s1_remove_account(&mut self, account_key: &[u8]) {
        #[allow(unused_assignments)] // The "last_page" variable is populated and modified in the loop.
        for index in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(index as u16, account_key);
            let last_page = self.s1_remove_account_page(&account_storage_key);
            if Self::s1_is_last_page(&last_page) {
                break;
            }
        }
    }

    /// Equivalent of [`super::AccountsDbTrait::db_accounts_len`].
    fn s1_accounts_len(&self) -> u64;

    /// Equivalent of [`super::AccountsDbTrait::values`].
    fn s1_values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        Box::new(self.s1_keys().filter_map(|key| self.s1_get_account(&key)))
    }

    /// Iterates over account identifiers, represented as bytes.
    fn s1_keys(&self) -> Box<dyn Iterator<Item = Vec<u8>> + '_>;
}

/// Key for account data in a stable `BTreeMap`.
///
/// This structure deals with the low level representation of the key as bytes.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd)]
pub struct AccountStorageKey {
    // TODO: Consider changing this to Cow<'a, [u8]>.
    bytes: [u8; AccountStorageKey::SIZE],
}
impl Storable for AccountStorageKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        self.bytes[..].into()
    }
    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        Self {
            bytes: bytes
                .into_owned()
                .try_into()
                .map_err(|err| format!("Attempt to create AccountStorageKey from bytes of wrong length: {err:?}"))
                .unwrap(),
        }
    }
}
impl BoundedStorable for AccountStorageKey {
    const MAX_SIZE: u32 = Self::SIZE as u32;
    const IS_FIXED_SIZE: bool = true;
}
impl AccountStorageKey {
    /// Location of the page number in the key bytes.
    ///
    /// Note: When an account is serialized, it is split into pages and the pages are stored in a
    /// BTreeMap.  The first page for that account has page number 0, the second 1 and so on.  The
    /// `PAGE_NUM` field referred to here is where the page number appears in the lookup key.
    const PAGE_NUM_OFFSET: usize = 0;
    /// The number of bytes used to store the page num.
    ///
    /// Note: The largest accounts currently serialize to about 4MiB.  Pages are 1KiB, so the
    /// largest accounts will have about 4096 pages.  By giving ourselves 2 bytes, we can store the
    /// page number as a u16 which suffices for the large accounts.  For most accounts, one page suffices.
    const PAGE_NUM_BYTES: usize = 2;

    /// Location of the account identifier length in the key bytes.
    ///
    /// Note: Account identifiers typically consume 32 bytes, however some are shorter.
    const ACCOUNT_IDENTIFIER_LEN_OFFSET: usize = Self::PAGE_NUM_OFFSET + Self::PAGE_NUM_BYTES;
    /// The number of bytes used to store the identifier length.
    const ACCOUNT_IDENTIFIER_LEN_BYTES: usize = 1;

    /// Location of the account identifier in the key bytes.
    const ACCOUNT_IDENTIFIER_OFFSET: usize = Self::ACCOUNT_IDENTIFIER_LEN_OFFSET + Self::ACCOUNT_IDENTIFIER_LEN_BYTES;
    /// The maximum number of bytes for an account identifier.
    const ACCOUNT_IDENTIFIER_MAX_BYTES: usize = 32;

    /// The total number of bytes in a key.
    const SIZE: usize = Self::ACCOUNT_IDENTIFIER_OFFSET + Self::ACCOUNT_IDENTIFIER_MAX_BYTES;

    /// Creates the key to look up the Nth page of a given account.
    ///
    /// Account identifiers have historically been provided as `Vec<u8>`.  We continue this tradition,
    /// although it is tempting to use `AccountIdentifier` instead.
    pub fn new(page_num: u16, account_identifier: &[u8]) -> Self {
        let account_identifier_len = account_identifier.len() as u8;
        let mut ans = [0u8; Self::MAX_SIZE as usize];
        ans[Self::PAGE_NUM_OFFSET..Self::PAGE_NUM_OFFSET + Self::PAGE_NUM_BYTES]
            .copy_from_slice(&page_num.to_le_bytes());
        ans[Self::ACCOUNT_IDENTIFIER_LEN_OFFSET] = account_identifier_len;
        ans[Self::ACCOUNT_IDENTIFIER_OFFSET..Self::ACCOUNT_IDENTIFIER_OFFSET + account_identifier.len()]
            .copy_from_slice(account_identifier);
        Self { bytes: ans }
    }

    /// Gets the account identifier as bytes.
    pub fn account_identifier_bytes(&self) -> Vec<u8> {
        let account_identifier_len = self.bytes[Self::ACCOUNT_IDENTIFIER_LEN_OFFSET] as usize;
        self.bytes[Self::ACCOUNT_IDENTIFIER_OFFSET..Self::ACCOUNT_IDENTIFIER_OFFSET + account_identifier_len].to_vec()
    }

    /// Gets the page number.
    pub fn page_num(&self) -> u8 {
        self.bytes[Self::PAGE_NUM_OFFSET]
    }
}

/// A page of account data; a single account is stored on one or more pages.
///
/// This structure deals with the low level representation of the account data as bytes.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct AccountStoragePage {
    /// Fixed size byte representation of an account.
    bytes: [u8; AccountStoragePage::SIZE as usize],
}
impl Storable for AccountStoragePage {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        self.bytes[..].into()
    }
    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        Self {
            bytes: bytes
                .into_owned()
                .try_into()
                .map_err(|err| format!("Attempt to create AccountStoragePage from bytes of wrong length: {err:?}"))
                .unwrap(),
        }
    }
}
impl BoundedStorable for AccountStoragePage {
    const MAX_SIZE: u32 = AccountStoragePage::SIZE as u32;
    const IS_FIXED_SIZE: bool = true;
}
impl AccountStoragePage {
    /// The size of a page in bytes.
    pub const SIZE: u16 = 1024;
    /// The offset of the length header
    pub const LEN_OFFSET: usize = 0;
    /// The length of the length header
    pub const LEN_LEN: usize = 2;
    /// The offset of the serialized candid payload.
    pub const PAYLOAD_OFFSET: usize = Self::LEN_OFFSET + Self::LEN_LEN;
    /// The maximum length of the payload.
    pub const MAX_PAYLOAD_LEN: usize = Self::SIZE as usize - Self::PAYLOAD_OFFSET;

    fn new(chunk: &[u8]) -> Self {
        if chunk.len() > Self::MAX_PAYLOAD_LEN {
            panic!("Attempt to create AccountStoragePage from chunk of length {}, which is longer than the maximum payload length of {}.", chunk.len(), Self::MAX_PAYLOAD_LEN);
        }
        let page_len = chunk.len() as u16;
        let mut page = [0u8; Self::SIZE as usize];
        page[Self::LEN_OFFSET..Self::LEN_OFFSET + Self::LEN_LEN].copy_from_slice(&page_len.to_le_bytes()[..]);
        page[Self::PAYLOAD_OFFSET..Self::PAYLOAD_OFFSET + chunk.len()].copy_from_slice(chunk);
        Self { bytes: page }
    }
    fn pages_from_account(account: &Account) -> Vec<Self> {
        let account_serialized = Candid((account,)).into_bytes().unwrap();
        account_serialized
            .chunks(Self::MAX_PAYLOAD_LEN)
            .map(Self::new)
            .collect::<Vec<_>>()
    }
    /// The payload length.
    fn len(&self) -> usize {
        let len_bytes = self.bytes[Self::LEN_OFFSET..Self::LEN_OFFSET + Self::LEN_LEN]
            .try_into()
            .unwrap();
        u16::from_le_bytes(len_bytes) as usize
    }
}
