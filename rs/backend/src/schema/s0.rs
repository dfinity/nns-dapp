//! Data storage schema S0: Accounts data is stored in stable structures,
//! other data is on the heap and serialized in pre_upgrade hooks.

use ic_stable_structures::storable::{Storable, BoundedStorable};
use std::borrow::Cow;
use std::convert::TryInto;
use dfn_candid::Candid;
use crate::accounts_store::Account;
use on_wire::{FromWire, IntoWire};

pub trait AccountStorageTrait {
    // Low level methods to get and set pages.
    fn get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage>;
    fn insert_account_page(&mut self, account_storage_key: AccountStorageKey, account: AccountStoragePage);
    fn contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool;
    fn remove_account_page(&mut self, account_storage_key: &AccountStorageKey);
    fn get_account_pages(&self, account_storage_key: &AccountStorageKey) -> Vec<AccountStoragePage> {
        let mut ans = Vec::new();
        let mut account_storage_key = *account_storage_key;
        while self.contains_account_page(&account_storage_key) {
            ans.push(self.get_account_page(&account_storage_key).unwrap());
            account_storage_key = account_storage_key.next();
        }
        ans
    }

    // High level methods to get and set accounts.
    fn contains_account(&self, account_key: &[u8]) -> bool {
        let account_storage_key = AccountStorageKey::new(0, account_key);
        self.contains_account_page(&account_storage_key)
    }
    fn get_account(&self, account_key: &[u8]) -> Option<Account> {
        let mut bytes = Vec::new();
        let mut have_account = false;
        for page_num in 0.. {
            let account_storage_key = AccountStorageKey::new(page_num, account_key);
            if let Some(page) = self.get_account_page(&account_storage_key) {
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
            let (account,) = Candid::from_bytes(bytes).map(|c| c.0).expect("Failed to parse account from store.");
            Some(account)
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests;

/// Key for account data in a stable BTreeMap.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct AccountStorageKey {
    // TODO: Consider changing this to Cow<'a, [u8]>.
    bytes: [u8;AccountStorageKey::MAX_SIZE as usize],
}
impl Storable for AccountStorageKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        self.bytes[..].into()
    }
    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        Self{
            bytes: bytes.into_owned().try_into().map_err(|err| format!("Attempt to create AccountStorageKey from bytes of wrong length: {err:?}")).unwrap(),
        }
    }
}
impl BoundedStorable for AccountStorageKey {
    const MAX_SIZE: u32 = 34;
    const IS_FIXED_SIZE: bool = true;
}
impl AccountStorageKey {
    /// Location of the page number in the key bytes.
    const PAGE_NUM_OFFSET: usize = 0;
    /// Location of the account identifier length in the key bytes.
    const ACCOUNT_IDENTIFIER_LEN_OFFSET: usize = 1;
    /// Location of the account identifier in the key bytes.
    const ACCOUNT_IDENTIFIER_OFFSET: usize = 2;

    /// Accounts are currently keyed by Vec[u8]; we continue this tradition, although it is tempting to use AccountIdentifier instead.
    pub fn new(page_num: u8, account_identifier: &[u8]) -> Self {
        let account_identifier_len = account_identifier.len() as u8;
        let mut ans = [0u8;Self::MAX_SIZE as usize];
        ans[Self::PAGE_NUM_OFFSET] = page_num;
        ans[Self::ACCOUNT_IDENTIFIER_LEN_OFFSET] = account_identifier_len;
        ans[Self::ACCOUNT_IDENTIFIER_OFFSET..Self::ACCOUNT_IDENTIFIER_OFFSET+account_identifier.len()].copy_from_slice(&account_identifier);
        Self { bytes: ans }
    }

    /// Gets the key to the next page.
    pub fn next(&self) -> Self {
        let mut ans = self.bytes.clone();
        ans[Self::PAGE_NUM_OFFSET] += 1;
        Self { bytes: ans }
    }
}

/// A page of account data; a single account is stored on one or more pages.
pub struct AccountStoragePage {
    /// TODO: See whether this can be variable length.  Stable structures would have to support this.
    bytes: [u8;AccountStoragePage::SIZE as usize],
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
        if chunk.len() > Self::MAX_PAYLOAD_LEN as usize {
            panic!("Attempt to create AccountStoragePage from chunk of length {}, which is longer than the maximum payload length of {}.", chunk.len(), Self::MAX_PAYLOAD_LEN);
        }
        let page_len = chunk.len() as u16;
        let mut page = [0u8;Self::SIZE as usize];
        page[Self::LEN_OFFSET..Self::LEN_OFFSET+Self::LEN_LEN].copy_from_slice(&page_len.to_le_bytes()[..]);
        page[Self::PAYLOAD_OFFSET..Self::PAYLOAD_OFFSET+chunk.len()].copy_from_slice(chunk);
        Self{bytes: page}
    }
    fn pages_from_account(account: &Account) -> Vec<Self> {
            let account_serialized = Candid((account,)).into_bytes().unwrap();
            account_serialized.chunks(Self::MAX_PAYLOAD_LEN).map(Self::new).collect::<Vec<_>>()
    }
    /// The payload length.
    fn len(&self) -> usize {
        let len_bytes = self.bytes[Self::LEN_OFFSET..Self::LEN_OFFSET+Self::LEN_LEN].try_into().unwrap();
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