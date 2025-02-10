//! User accounts and transactions.
use crate::state::{partitions::PartitionType, with_partitions, StableState};
use crate::stats::Stats;
use candid::CandidType;
use dfn_candid::Candid;
use histogram::AccountsStoreHistogram;
use ic_base_types::{CanisterId, PrincipalId};
use ic_stable_structures::{
    memory_manager::VirtualMemory, storable::Bound, DefaultMemoryImpl, StableBTreeMap, Storable,
};
use icp_ledger::{AccountIdentifier, BlockIndex, Subaccount};
use itertools::Itertools;
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::borrow::Cow;
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashMap, VecDeque};
use std::fmt;

pub mod histogram;

// This limit is for DoS protection but should be increased if we get close to
// the limit.
const ACCOUNT_LIMIT: u64 = 330_000;

const MAX_SUB_ACCOUNT_ID: u8 = u8::MAX - 1;

// Conservatively limit the number of imported tokens to prevent using too much memory.
// Can be revisited if users find this too restrictive.
const MAX_IMPORTED_TOKENS: i32 = 20;

/// Accounts and related data.
pub struct AccountsStore {
    // TODO(NNS1-720): Use AccountIdentifier directly as the key for this HashMap
    accounts_db: StableBTreeMap<Vec<u8>, Account, VirtualMemory<DefaultMemoryImpl>>,
    accounts_db_stats: AccountsDbStats,
}

impl Default for AccountsStore {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Debug for AccountsStore {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "AccountsStore{{accounts_db: StableBTreeMap{{.. {} entries}}, accounts_db_stats: {:?}}}",
            self.accounts_db.len(),
            self.accounts_db_stats,
        )
    }
}

/// Check whether two account databases contain the same data.
///
/// It should be possible to use this to confirm that data has been preserved during a migration.
#[cfg(test)]
impl PartialEq for AccountsStore {
    fn eq(&self, other: &Self) -> bool {
        self.accounts_db.range(..).eq(other.accounts_db.range(..)) && self.accounts_db_stats == other.accounts_db_stats
    }
}
#[cfg(test)]
impl Eq for AccountsStore {}

#[derive(Default, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct AccountsDbStats {
    pub sub_accounts_count: u64,
    pub hardware_wallet_accounts_count: u64,
}

/// A user's account.
#[derive(CandidType, Deserialize, Debug, Eq, PartialEq, Clone)]
pub struct Account {
    /// The user principal.
    ///
    /// Note: The principal was not stored for early users.  When early users log in, we discover their principal and set this field.
    principal: Option<PrincipalId>,
    account_identifier: AccountIdentifier,
    sub_accounts: HashMap<u8, NamedSubAccount>,
    hardware_wallet_accounts: Vec<NamedHardwareWalletAccount>,
    canisters: Vec<NamedCanister>,
    imported_tokens: Option<ImportedTokens>,
    // default_account_transactions: Do not reuse this field. There are still accounts in stable memor with this unused field.
}

impl Storable for Account {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        candid::encode_one(self).expect("Failed to serialize account").into()
    }
    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to parse account from store.")
    }
}

#[derive(CandidType, Deserialize, Debug, Eq, PartialEq, Clone)]
struct NamedSubAccount {
    name: String,
    account_identifier: AccountIdentifier,
    // transactions: Do not reuse this field. There are still accounts in stable memory with this unused field.
}

#[derive(CandidType, Deserialize, Debug, Eq, PartialEq, Clone)]
struct NamedHardwareWalletAccount {
    name: String,
    principal: PrincipalId,
    // transactions: Do not reuse this field. There are still accounts in stable memor with this unused field.
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NamedCanister {
    name: String,
    canister_id: CanisterId,
    block_index: Option<BlockIndex>,
}

impl NamedCanister {
    /// A value used to decide how `NamedCanister`s are sorted.
    ///
    /// This will sort the canisters such that those with names specified will appear first and will be
    /// sorted by their names. Then those without names will appear last, sorted by their canister Ids.
    ///
    /// Note: This allocates a string, so for sorting long lists this will be slow.
    /// - Consider using `sort_by_cached_key(|x| x.sorting_key())`, if allowed in canisters.
    /// - Determine whether the native ordering of principals is acceptable.  If so, the key can
    ///   be of type `(bool, &str, &Principal)` where the string is the name.
    fn sorting_key(&self) -> (bool, String) {
        if self.name.is_empty() {
            (true, self.canister_id.to_string())
        } else {
            (false, self.name.clone())
        }
    }
}
impl Ord for NamedCanister {
    fn cmp(&self, other: &Self) -> Ordering {
        self.sorting_key().cmp(&other.sorting_key())
    }
}
impl PartialOrd for NamedCanister {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(CandidType, Clone, Copy, Default, Deserialize, Debug, Eq, PartialEq)]
pub struct ImportedToken {
    ledger_canister_id: PrincipalId,
    index_canister_id: Option<PrincipalId>,
}

#[derive(CandidType, Clone, Default, Deserialize, Debug, Eq, PartialEq)]
pub struct ImportedTokens {
    imported_tokens: Vec<ImportedToken>,
}

#[derive(CandidType, Debug, PartialEq)]
pub enum SetImportedTokensResponse {
    Ok,
    AccountNotFound,
    TooManyImportedTokens { limit: i32 },
}

#[derive(CandidType, Debug, PartialEq)]
pub enum GetImportedTokensResponse {
    Ok(ImportedTokens),
    AccountNotFound,
}

#[derive(CandidType, Debug, PartialEq)]
pub enum CreateSubAccountResponse {
    Ok(SubAccountDetails),
    AccountNotFound,
    SubAccountLimitExceeded,
    NameTooLong,
}

#[derive(CandidType, Deserialize)]
pub struct RenameSubAccountRequest {
    account_identifier: AccountIdentifier,
    new_name: String,
}

#[derive(CandidType)]
pub enum RenameSubAccountResponse {
    Ok,
    AccountNotFound,
    SubAccountNotFound,
    NameTooLong,
}

#[derive(CandidType, Deserialize)]
pub struct RegisterHardwareWalletRequest {
    name: String,
    principal: PrincipalId,
}

#[cfg(test)]
impl RegisterHardwareWalletRequest {
    pub fn test_data() -> Self {
        RegisterHardwareWalletRequest {
            name: "test".to_string(),
            principal: PrincipalId::new_user_test_id(0),
        }
    }
}

#[derive(CandidType)]
pub enum RegisterHardwareWalletResponse {
    Ok,
    AccountNotFound,
    HardwareWalletAlreadyRegistered,
    HardwareWalletLimitExceeded,
    NameTooLong,
}

#[derive(CandidType)]
pub struct AccountDetails {
    pub principal: PrincipalId,
    pub account_identifier: AccountIdentifier,
    pub sub_accounts: Vec<SubAccountDetails>,
    pub hardware_wallet_accounts: Vec<HardwareWalletAccountDetails>,
}

#[derive(CandidType, Debug, PartialEq)]
pub struct SubAccountDetails {
    name: String,
    sub_account: Subaccount,
    account_identifier: AccountIdentifier,
}

#[derive(CandidType)]
pub struct HardwareWalletAccountDetails {
    pub name: String,
    pub principal: PrincipalId,
    pub account_identifier: AccountIdentifier,
}

#[derive(CandidType, Deserialize)]
pub struct AttachCanisterRequest {
    name: String,
    canister_id: CanisterId,
    block_index: Option<BlockIndex>,
}

#[derive(CandidType)]
pub enum AttachCanisterResponse {
    Ok,
    CanisterLimitExceeded,
    CanisterAlreadyAttached,
    NameAlreadyTaken,
    NameTooLong,
    AccountNotFound,
}

#[derive(CandidType, Deserialize)]
pub struct RenameCanisterRequest {
    name: String,
    canister_id: CanisterId,
}

#[derive(CandidType)]
pub enum RenameCanisterResponse {
    Ok,
    NameAlreadyTaken,
    NameTooLong,
    AccountNotFound,
    CanisterNotFound,
}

#[derive(CandidType, Deserialize)]
pub struct DetachCanisterRequest {
    canister_id: CanisterId,
}

#[derive(CandidType)]
pub enum DetachCanisterResponse {
    Ok,
    CanisterNotFound,
    AccountNotFound,
}

impl AccountsStore {
    /// Creates a new `AccountsStore`. Should be called during canister `init`.
    #[must_use]
    pub fn new() -> Self {
        let accounts_partition = with_partitions(|partitions| partitions.get(PartitionType::Accounts.memory_id()));
        let accounts_db = StableBTreeMap::new(accounts_partition);
        let accounts_db_stats = AccountsDbStats::default();

        Self {
            accounts_db,
            accounts_db_stats,
        }
    }

    #[must_use]
    pub fn get_account(&self, caller: PrincipalId) -> Option<AccountDetails> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts_db.get(&account_identifier.to_vec()) {
            // If the principal is empty, return None so that the browser will call add_account
            // which will allow us to set the principal.
            let principal = account.principal?;

            let sub_accounts = account
                .sub_accounts
                .iter()
                .sorted_unstable_by_key(|(_, sub_account)| sub_account.name.clone())
                .map(|(id, sa)| SubAccountDetails {
                    name: sa.name.clone(),
                    sub_account: convert_byte_to_sub_account(*id),
                    account_identifier: sa.account_identifier,
                })
                .collect();

            let hardware_wallet_accounts = account
                .hardware_wallet_accounts
                .iter()
                .map(|a| HardwareWalletAccountDetails {
                    name: a.name.clone(),
                    principal: a.principal,
                    account_identifier: AccountIdentifier::from(a.principal),
                })
                .collect();

            Some(AccountDetails {
                principal,
                account_identifier,
                sub_accounts,
                hardware_wallet_accounts,
            })
        } else {
            None
        }
    }

    // This will be called for new accounts and also for old accounts where the principal has not
    // yet been stored, allowing us to set the principal (since originally we created accounts
    // without storing each user's principal).
    pub fn add_account(&mut self, caller: PrincipalId) -> bool {
        self.assert_account_limit();
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts_db.get(&account_identifier.to_vec()) {
            if account.principal.is_none() {
                // This is an old account that needs a one-off fix to set the principal and update the transactions.
                let mut account = account.clone();
                account.principal = Some(caller);
                self.accounts_db.insert(account_identifier.to_vec(), account);
            }
            false
        } else {
            let new_account = Account::new(caller, account_identifier);
            self.accounts_db.insert(account_identifier.to_vec(), new_account);

            true
        }
    }

    /// Creates a sub-account for the given user.
    pub fn create_sub_account(&mut self, caller: PrincipalId, sub_account_name: String) -> CreateSubAccountResponse {
        self.assert_account_limit();
        let account_identifier = AccountIdentifier::from(caller);

        if !Self::validate_account_name(&sub_account_name) {
            return CreateSubAccountResponse::NameTooLong;
        }

        let Some(mut account) = self.accounts_db.get(&account_identifier.to_vec()) else {
            return CreateSubAccountResponse::AccountNotFound;
        };

        let Some(sub_account_id) = (1..=MAX_SUB_ACCOUNT_ID).find(|i| !account.sub_accounts.contains_key(i)) else {
            return CreateSubAccountResponse::SubAccountLimitExceeded;
        };

        let sub_account = convert_byte_to_sub_account(sub_account_id);
        let sub_account_identifier = AccountIdentifier::new(caller, Some(sub_account));
        let named_sub_account = NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);

        account.sub_accounts.insert(sub_account_id, named_sub_account);
        self.accounts_db.insert(account_identifier.to_vec(), account);

        self.accounts_db_stats.sub_accounts_count += 1;

        CreateSubAccountResponse::Ok(SubAccountDetails {
            name: sub_account_name,
            sub_account,
            account_identifier: sub_account_identifier,
        })
    }

    pub fn rename_sub_account(
        &mut self,
        caller: PrincipalId,
        request: RenameSubAccountRequest,
    ) -> RenameSubAccountResponse {
        let account_identifier = AccountIdentifier::from(caller).to_vec();

        if !Self::validate_account_name(&request.new_name) {
            RenameSubAccountResponse::NameTooLong
        } else if let Some(mut account) = self.accounts_db.get(&account_identifier) {
            if let Some(sub_account) = account
                .sub_accounts
                .values_mut()
                .find(|sub_account| sub_account.account_identifier == request.account_identifier)
            {
                sub_account.name = request.new_name;
                self.accounts_db.insert(account_identifier, account);
                RenameSubAccountResponse::Ok
            } else {
                RenameSubAccountResponse::SubAccountNotFound
            }
        } else {
            RenameSubAccountResponse::AccountNotFound
        }
    }

    pub fn register_hardware_wallet(
        &mut self,
        caller: PrincipalId,
        request: RegisterHardwareWalletRequest,
    ) -> RegisterHardwareWalletResponse {
        let account_identifier = AccountIdentifier::from(caller);

        if !Self::validate_account_name(&request.name) {
            RegisterHardwareWalletResponse::NameTooLong
        } else if let Some(mut account) = self.accounts_db.get(&account_identifier.to_vec()).clone() {
            if account.hardware_wallet_accounts.len() == (u8::MAX as usize) {
                RegisterHardwareWalletResponse::HardwareWalletLimitExceeded
            } else if account
                .hardware_wallet_accounts
                .iter()
                .any(|hw| hw.principal == request.principal)
            {
                RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered
            } else {
                account.hardware_wallet_accounts.push(NamedHardwareWalletAccount {
                    name: request.name,
                    principal: request.principal,
                });
                account
                    .hardware_wallet_accounts
                    .sort_unstable_by_key(|hw| hw.name.clone());
                self.accounts_db.insert(account_identifier.to_vec(), account);

                self.accounts_db_stats.hardware_wallet_accounts_count += 1;
                RegisterHardwareWalletResponse::Ok
            }
        } else {
            RegisterHardwareWalletResponse::AccountNotFound
        }
    }

    fn find_canister_index(account: &Account, canister_id: CanisterId) -> Option<usize> {
        account
            .canisters
            .iter()
            .enumerate()
            .find(|(_, canister)| canister.canister_id == canister_id)
            .map(|(index, _)| index)
    }

    pub fn attach_canister(&mut self, caller: PrincipalId, request: AttachCanisterRequest) -> AttachCanisterResponse {
        if !Self::validate_canister_name(&request.name) {
            return AttachCanisterResponse::NameTooLong;
        }

        let account_identifier = AccountIdentifier::from(caller).to_vec();

        let Some(mut account) = self.accounts_db.get(&account_identifier) else {
            return AttachCanisterResponse::AccountNotFound;
        };

        let mut new_canister = NamedCanister {
            name: request.name,
            canister_id: request.canister_id,
            block_index: request.block_index,
        };

        let mut index_to_remove: Option<usize> = None;
        for (index, existing_canister) in account.canisters.iter().enumerate() {
            if !new_canister.name.is_empty()
                && existing_canister.name == new_canister.name
                && existing_canister.canister_id != new_canister.canister_id
            {
                return AttachCanisterResponse::NameAlreadyTaken;
            }
            // The canister might already be attached.
            // If the request is compatible with the existing canister, merge
            // any existing information into the new canister.
            if existing_canister.canister_id == new_canister.canister_id {
                // We return CanisterAlreadyAttached if either the request is
                // incompatible with the existing canister or this request
                // doesn't add anything new.

                if !existing_canister.name.is_empty() {
                    if new_canister.name.is_empty() {
                        new_canister.name.clone_from(&existing_canister.name);
                    } else if existing_canister.name != new_canister.name {
                        // Incompatible names.
                        return AttachCanisterResponse::CanisterAlreadyAttached;
                    }
                }

                if existing_canister.block_index.is_some() {
                    if new_canister.block_index.is_none() {
                        new_canister.block_index = existing_canister.block_index;
                    } else if existing_canister.block_index != new_canister.block_index {
                        // Incompatible block_index.
                        return AttachCanisterResponse::CanisterAlreadyAttached;
                    }
                }

                if new_canister == *existing_canister {
                    // Nothing new to add.
                    return AttachCanisterResponse::CanisterAlreadyAttached;
                }

                index_to_remove = Some(index);
            }
        }

        if let Some(index) = index_to_remove {
            // Remove the previous attached canister before reattaching.
            account.canisters.remove(index);
        }

        if account.canisters.len() >= u8::MAX as usize {
            return AttachCanisterResponse::CanisterLimitExceeded;
        }
        account.canisters.push(new_canister);
        account.canisters.sort();

        self.accounts_db.insert(account_identifier, account);

        AttachCanisterResponse::Ok
    }

    pub fn rename_canister(&mut self, caller: PrincipalId, request: RenameCanisterRequest) -> RenameCanisterResponse {
        if Self::validate_canister_name(&request.name) {
            let account_identifier = AccountIdentifier::from(caller).to_vec();

            if let Some(mut account) = self.accounts_db.get(&account_identifier) {
                if !request.name.is_empty() && account.canisters.iter().any(|c| c.name == request.name) {
                    return RenameCanisterResponse::NameAlreadyTaken;
                }

                if let Some(index) = Self::find_canister_index(&account, request.canister_id) {
                    let existing_canister = account.canisters.remove(index);
                    account.canisters.push(NamedCanister {
                        name: request.name,
                        ..existing_canister
                    });
                    account.canisters.sort();
                    self.accounts_db.insert(account_identifier, account);
                    RenameCanisterResponse::Ok
                } else {
                    RenameCanisterResponse::CanisterNotFound
                }
            } else {
                RenameCanisterResponse::AccountNotFound
            }
        } else {
            RenameCanisterResponse::NameTooLong
        }
    }

    #[allow(clippy::needless_pass_by_value)] // The pattern here is to pass a request by value.
    pub fn detach_canister(&mut self, caller: PrincipalId, request: DetachCanisterRequest) -> DetachCanisterResponse {
        let account_identifier = AccountIdentifier::from(caller).to_vec();

        if let Some(mut account) = self.accounts_db.get(&account_identifier) {
            if let Some(index) = Self::find_canister_index(&account, request.canister_id) {
                account.canisters.remove(index);
                self.accounts_db.insert(account_identifier, account);
                DetachCanisterResponse::Ok
            } else {
                DetachCanisterResponse::CanisterNotFound
            }
        } else {
            DetachCanisterResponse::AccountNotFound
        }
    }

    #[must_use]
    pub fn get_canisters(&self, caller: PrincipalId) -> Vec<NamedCanister> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts_db.get(&account_identifier.to_vec()) {
            account.canisters.clone()
        } else {
            Vec::new()
        }
    }

    pub fn set_imported_tokens(
        &mut self,
        caller: PrincipalId,
        new_imported_tokens: ImportedTokens,
    ) -> SetImportedTokensResponse {
        if new_imported_tokens.imported_tokens.len() > (MAX_IMPORTED_TOKENS as usize) {
            return SetImportedTokensResponse::TooManyImportedTokens {
                limit: MAX_IMPORTED_TOKENS,
            };
        }
        let account_identifier = AccountIdentifier::from(caller).to_vec();
        let Some(mut account) = self.accounts_db.get(&account_identifier) else {
            return SetImportedTokensResponse::AccountNotFound;
        };

        account.imported_tokens = Some(new_imported_tokens);

        self.accounts_db.insert(account_identifier, account);
        SetImportedTokensResponse::Ok
    }

    pub fn get_imported_tokens(&mut self, caller: PrincipalId) -> GetImportedTokensResponse {
        let account_identifier = AccountIdentifier::from(caller).to_vec();
        let Some(account) = self.accounts_db.get(&account_identifier) else {
            return GetImportedTokensResponse::AccountNotFound;
        };

        GetImportedTokensResponse::Ok(account.imported_tokens.unwrap_or_default())
    }

    pub fn get_stats(&self, stats: &mut Stats) {
        stats.accounts_count = self.accounts_db.len();
        stats.sub_accounts_count = self.accounts_db_stats.sub_accounts_count;
        stats.hardware_wallet_accounts_count = self.accounts_db_stats.hardware_wallet_accounts_count;
        stats.migration_countdown = Some(0);
    }

    #[must_use]
    pub fn get_histogram(&self) -> AccountsStoreHistogram {
        self.accounts_db
            .values()
            .fold(AccountsStoreHistogram::default(), |histogram, account| {
                histogram + &account
            })
    }

    fn validate_account_name(name: &str) -> bool {
        const ACCOUNT_NAME_MAX_LENGTH: usize = 24;

        name.len() <= ACCOUNT_NAME_MAX_LENGTH
    }

    fn validate_canister_name(name: &str) -> bool {
        const CANISTER_NAME_MAX_LENGTH: usize = 24;

        name.len() <= CANISTER_NAME_MAX_LENGTH
    }

    fn assert_account_limit(&self) {
        let db_accounts_len = self.accounts_db.len();
        assert!(
            db_accounts_len < ACCOUNT_LIMIT,
            "Pre migration account limit exceeded {db_accounts_len}"
        );
    }
}

impl StableState for AccountsStore {
    fn encode(&self) -> Vec<u8> {
        // Accounts are now in stable structures and no longer in a simple map
        // on the heap. So we don't need to encode them here.
        let empty_accounts = BTreeMap::<Vec<u8>, candid::Empty>::new();
        Candid((
            empty_accounts,
            // hardware_wallets_and_sub_accounts is unused but we need to encode
            // it for backwards compatibility.
            HashMap::<AccountIdentifier, candid::Empty>::new(),
            // Pending transactions are unused but we need to encode them for
            // backwards compatibility.
            HashMap::<(AccountIdentifier, AccountIdentifier), candid::Empty>::new(),
            // Transactions are unused but we need to encode them for backwards
            // compatibility.
            VecDeque::<candid::Empty>::new(),
            // Neuron accounts are unused but we need to encode them for
            // backwards compatibility.
            HashMap::<AccountIdentifier, candid::Empty>::new(),
            // block_height_synced_up_to is unused but we need to encode it for
            // backwards compatibility.
            None as Option<BlockIndex>,
            // multi_part_transactions_processor is unused but we need to encode
            // something for backwards compatibility.
            (),
            // last_ledger_sync_timestamp_nanos is unused but we need to encode
            // it for backwards compatibility.
            0u64,
            // neurons_topped_up_count is unused but we need to encode
            // it for backwards compatibility.
            0u64,
            Some(&self.accounts_db_stats),
        ))
        .into_bytes()
        .unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        #[allow(clippy::type_complexity)]
        let (
            // Accounts are now in stable structures and no longer in a simple
            // map on the heap. So we don't need to decode them here.
            _accounts,
            _hardware_wallets_and_sub_accounts,
            _pending_transactions,
            // Transactions are unused but we need to decode something for backwards
            // compatibility.
            _transactions,
            _neuron_accounts,
            _block_height_synced_up_to,
            _multi_part_transactions_processor,
            _last_ledger_sync_timestamp_nanos,
            _neurons_topped_up_count,
            accounts_db_stats_maybe,
        ): (
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            candid::Reserved,
            Option<AccountsDbStats>,
        ) = Candid::from_bytes(bytes).map(|c| c.0)?;

        let Some(accounts_db_stats) = accounts_db_stats_maybe else {
            return Err("Accounts DB stats should be present since the stable structures migration.".to_string());
        };
        let accounts_partition = with_partitions(|partitions| partitions.get(PartitionType::Accounts.memory_id()));
        let accounts_db = StableBTreeMap::load(accounts_partition);

        Ok(AccountsStore {
            accounts_db,
            accounts_db_stats,
        })
    }
}

impl Account {
    #[must_use]
    pub fn new(principal: PrincipalId, account_identifier: AccountIdentifier) -> Account {
        Account {
            principal: Some(principal),
            account_identifier,
            sub_accounts: HashMap::new(),
            hardware_wallet_accounts: Vec::new(),
            canisters: Vec::new(),
            imported_tokens: None,
        }
    }
}

impl NamedSubAccount {
    pub fn new(name: String, account_identifier: AccountIdentifier) -> NamedSubAccount {
        NamedSubAccount {
            name,
            account_identifier,
        }
    }
}

fn convert_byte_to_sub_account(byte: u8) -> Subaccount {
    let mut bytes = [0u8; 32];
    bytes[31] = byte;
    Subaccount(bytes)
}

#[cfg(test)]
pub(crate) mod tests;
#[cfg(any(test, feature = "toy_data_gen"))]
pub(crate) mod toy_data;
