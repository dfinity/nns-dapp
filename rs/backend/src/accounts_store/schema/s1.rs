//! Data storage schema `S1`: Accounts data is stored in a StableBTreeMap,
//! other data is on the heap and serialized in `pre_upgrade` hooks.
//!
//! ## Pagination
//! Stable structures `BTreeMaps` currently support only fixed size data structures.
//! Variable size data structures may come at some time but until then, we need to work around this
//! limitation.  We do so by splitting the serialized data across fixed size pages and keying
//! the stable `BTree` with the account number and page number.  We look up page 0, if it is full, we
//! get page 1 as well and so on until we have the full serialization.
//!
//! ## Testing
//! The StableBTreeMap can be simulated with a normal BTreeMap with fixed size byte arrays as
//! values.

use crate::accounts_store::Account;
use dfn_candid::Candid;
use ic_stable_structures::storable::{BoundedStorable, Storable};
use on_wire::{FromWire, IntoWire};
use std::borrow::Cow;
use std::convert::TryInto;

#[cfg(test)]
mod tests;

pub trait AccountsDbS1Trait {
    /// Every account  is serialized and stored in between 0 and 256 pages.
    const MAX_PAGES_PER_ACCOUNT: usize = (u8::MAX as usize) + 1;

    // Low level methods to get and set pages.
    /// Gets a page of memory.
    fn s1_get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage>;
    /// Inserts a page of memory.
    fn s1_insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage>;
    /// Checks whether a page of memory exists.
    fn s1_contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool;
    /// Removes a page of memory.
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
    // Note: Rust does not support traits on traits.  Imagine, when you read the following, that they implement the AccountsDbTrait.
    //       In reality, both traits are implemented for the AccountsStore struct.
    fn s1_get_account(&self, account_key: &[u8]) -> Option<Account> {
        let mut bytes = Vec::new();
        let mut have_account = false;
        for page_num in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(page_num as u8, account_key);
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
    fn s1_with_account<F, T>(&mut self, account_key: &[u8], f: F) -> Option<T>
    where
        // The closure takes an account as an argument.  It may return any type.
        F: Fn(&mut Account) -> T,
    {
        if let Some(mut account) = self.s1_get_account(account_key) {
            let ans = f(&mut account);
            self.s1_insert_account(account_key, account);
            Some(ans)
        } else {
            None
        }
    }
    fn s1_insert_account(&mut self, account_key: &[u8], account: Account) {
        // Serilaize the account into one or more pages.
        let pages_to_insert = AccountStoragePage::pages_from_account(&account);
        if pages_to_insert.len() > Self::MAX_PAGES_PER_ACCOUNT {
            panic!(
                "Attempt to insert account with {} pages, which is more than the maximum of {} pages.",
                pages_to_insert.len(),
                Self::MAX_PAGES_PER_ACCOUNT
            );
        }
        // Temporary store for pages that are replaced by new data.
        let mut last_removed_page = None;
        // Insert the new pages, and make sure that all old pages are removed.
        for index in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(index as u8, account_key);
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
    fn s1_contains_account(&self, account_key: &[u8]) -> bool {
        let account_storage_key = AccountStorageKey::new(0, account_key);
        self.s1_contains_account_page(&account_storage_key)
    }
    fn s1_remove_account(&mut self, account_key: &[u8]) {
        #[allow(unused_assignments)] // The "last_page" variable is populated and modified in the loop.
        let mut last_page = None;
        for index in 0..Self::MAX_PAGES_PER_ACCOUNT {
            let account_storage_key = AccountStorageKey::new(index as u8, account_key);
            last_page = self.s1_remove_account_page(&account_storage_key);
            if Self::s1_is_last_page(&last_page) {
                break;
            }
        }
    }
    fn s1_accounts_len(&self) -> u64;
}

/// Key for account data in a stable `BTreeMap`.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd)]
pub struct AccountStorageKey {
    // TODO: Consider changing this to Cow<'a, [u8]>.
    bytes: [u8; AccountStorageKey::SIZE as usize],
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
    const MAX_SIZE: u32 = Self::SIZE;
    const IS_FIXED_SIZE: bool = true;
}
impl AccountStorageKey {
    /// The number of bytes in a page
    const SIZE: u32 = 34;
    /// Location of the page number in the key bytes.
    const PAGE_NUM_OFFSET: usize = 0;
    /// Location of the account identifier length in the key bytes.
    const ACCOUNT_IDENTIFIER_LEN_OFFSET: usize = 1;
    /// Location of the account identifier in the key bytes.
    const ACCOUNT_IDENTIFIER_OFFSET: usize = 2;

    /// Accounts are currently keyed by `Vec<u8>`; we continue this tradition, although it is tempting to use `AccountIdentifier` instead.
    #[allow(dead_code)]
    pub fn new(page_num: u8, account_identifier: &[u8]) -> Self {
        let account_identifier_len = account_identifier.len() as u8;
        let mut ans = [0u8; Self::MAX_SIZE as usize];
        ans[Self::PAGE_NUM_OFFSET] = page_num;
        ans[Self::ACCOUNT_IDENTIFIER_LEN_OFFSET] = account_identifier_len;
        ans[Self::ACCOUNT_IDENTIFIER_OFFSET..Self::ACCOUNT_IDENTIFIER_OFFSET + account_identifier.len()]
            .copy_from_slice(account_identifier);
        Self { bytes: ans }
    }

    /// Gets the key to the next page.
    #[allow(dead_code)]
    pub fn next(&self) -> Self {
        let mut ans = self.bytes;
        ans[Self::PAGE_NUM_OFFSET] += 1;
        Self { bytes: ans }
    }

    /// Gets the page number.
    #[allow(dead_code)]
    pub fn page_num(&self) -> u8 {
        self.bytes[Self::PAGE_NUM_OFFSET]
    }
}

/// A page of account data; a single account is stored on one or more pages.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[allow(dead_code)]
pub struct AccountStoragePage {
    /// TODO: See whether this can be variable length.  Stable structures would have to support this.
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
                .map_err(|err| format!("Attempt to create AccountStorageKey from bytes of wrong length: {err:?}"))
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

    #[allow(dead_code)]
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
    #[allow(dead_code)]
    fn pages_from_account(account: &Account) -> Vec<Self> {
        let account_serialized = Candid((account,)).into_bytes().unwrap();
        account_serialized
            .chunks(Self::MAX_PAYLOAD_LEN)
            .map(Self::new)
            .collect::<Vec<_>>()
    }
    /// The payload length.
    #[allow(dead_code)]
    fn len(&self) -> usize {
        let len_bytes = self.bytes[Self::LEN_OFFSET..Self::LEN_OFFSET + Self::LEN_LEN]
            .try_into()
            .unwrap();
        u16::from_le_bytes(len_bytes) as usize
    }
}

/// We assume that new account identifiers are 32 bytes long.
///
/// Note: Old-style account identifiers were 28 bytes long.
#[test]
fn account_identifier_has_32_bytes() {
    let account_identifier = icp_ledger::AccountIdentifier::from(ic_base_types::PrincipalId::new_user_test_id(99));
    assert_eq!(account_identifier.to_vec().len(), 32);
}
