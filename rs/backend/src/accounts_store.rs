//! User accounts and transactions.
use crate::constants::{MEMO_CREATE_CANISTER, MEMO_TOP_UP_CANISTER};
use crate::multi_part_transactions_processor::{MultiPartTransactionToBeProcessed, MultiPartTransactionsProcessor};
use crate::state::StableState;
use crate::stats::Stats;
use candid::CandidType;
use dfn_candid::Candid;
use histogram::AccountsStoreHistogram;
use ic_base_types::{CanisterId, PrincipalId};
use ic_nns_common::types::NeuronId;
use ic_nns_constants::CYCLES_MINTING_CANISTER_ID;
use ic_stable_structures::{storable::Bound, Storable};
use icp_ledger::Operation::{self, Approve, Burn, Mint, Transfer};
use icp_ledger::{AccountIdentifier, BlockIndex, Memo, Subaccount};
use itertools::Itertools;
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::borrow::Cow;
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use std::fmt;
use std::ops::RangeBounds;
use std::time::{Duration, SystemTime};

pub mod constructors;
pub mod histogram;
pub mod schema;
use schema::{
    proxy::{AccountsDb, AccountsDbAsProxy},
    AccountsDbTrait,
};

// This limit is for DoS protection but should be increased if we get close to
// the limit.
const ACCOUNT_LIMIT: u64 = 300_000;

// Conservatively limit the number of imported tokens to prevent using too much memory.
// Can be revisited if users find this too restrictive.
const MAX_IMPORTED_TOKENS: i32 = 20;

/// Accounts, transactions and related data.
///
/// Note: Some monitoring fields are not included in the `Eq` and `PartialEq` implementations.  Additionally, please note
/// that the `ic_stable_structures::BTreeMap` does not have an implementation of `Eq`, so special care needs to be taken when comparing
/// data backed by stable structures.
#[derive(Default)]
#[cfg_attr(test, derive(Eq, PartialEq))]
pub struct AccountsStore {
    // TODO(NNS1-720): Use AccountIdentifier directly as the key for this HashMap
    accounts_db: schema::proxy::AccountsDbAsProxy,
    hardware_wallets_and_sub_accounts: HashMap<AccountIdentifier, AccountWrapper>,
    // pending_transactions: HashMap<(from, to), (TransactionType, timestamp_ms_since_epoch)>
    pending_transactions: HashMap<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>,

    // TODO: Remove neuron_accounts once not topping up neurons has been
    //       released for some time. Removing this field will have to be done in
    //       multiple steps because it is stored in stable memory during
    //       upgrades.
    neuron_accounts: HashMap<AccountIdentifier, NeuronDetails>,
    block_height_synced_up_to: Option<BlockIndex>,
    multi_part_transactions_processor: MultiPartTransactionsProcessor,
    accounts_db_stats: AccountsDbStats,
    accounts_db_stats_recomputed_on_upgrade: IgnoreEq<Option<bool>>,
    last_ledger_sync_timestamp_nanos: u64,
    neurons_topped_up_count: u64,
}

/// A wrapper around a value that returns true for `PartialEq` and `Eq` equality checks, regardless of the value.
///
/// This is intended to be used on incidental, volatile fields.  A structure containing such a field will typically wish to disregard the field in any comparison.
#[derive(Default)]
struct IgnoreEq<T>(T)
where
    T: Default;

impl<T: Default> PartialEq for IgnoreEq<T> {
    fn eq(&self, _: &Self) -> bool {
        true
    }
}

impl<T: Default> Eq for IgnoreEq<T> {}

impl fmt::Debug for AccountsStore {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "AccountsStore{{accounts_db: {:?}, hardware_wallets_and_sub_accounts: HashMap[{:?}], pending_transactions: HashMap[{:?}], neuron_accounts: HashMap[{:?}], block_height_synced_up_to: {:?}, multi_part_transactions_processor: {:?}, accounts_db_stats: {:?}, last_ledger_sync_timestamp_nanos: {:?}, neurons_topped_up_count: {:?}}}",
            self.accounts_db,
            self.hardware_wallets_and_sub_accounts.len(),
            self.pending_transactions.len(),
            self.neuron_accounts.len(),
            self.block_height_synced_up_to,
            self.multi_part_transactions_processor,
            self.accounts_db_stats,
            self.last_ledger_sync_timestamp_nanos,
            self.neurons_topped_up_count,
        )
    }
}

impl AccountsDbTrait for AccountsStore {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.accounts_db.db_insert_account(account_key, account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.accounts_db.db_contains_account(account_key)
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.accounts_db.db_get_account(account_key)
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.accounts_db.db_remove_account(account_key);
    }
    fn db_accounts_len(&self) -> u64 {
        self.accounts_db.db_accounts_len()
    }
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.accounts_db.iter()
    }
    fn first_key_value(&self) -> Option<(Vec<u8>, Account)> {
        self.accounts_db.first_key_value()
    }
    fn last_key_value(&self) -> Option<(Vec<u8>, Account)> {
        self.accounts_db.last_key_value()
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        self.accounts_db.values()
    }
    fn range(&self, key_range: impl RangeBounds<Vec<u8>>) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.accounts_db.range(key_range)
    }
}

#[derive(Default, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct AccountsDbStats {
    pub sub_accounts_count: u64,
    pub hardware_wallet_accounts_count: u64,
}

/// An abstraction over sub-accounts and hardware wallets.
#[derive(CandidType, Deserialize, Debug, Eq, PartialEq)]
enum AccountWrapper {
    SubAccount(AccountIdentifier, u8),      // Account Identifier + Sub Account Identifier
    HardwareWallet(Vec<AccountIdentifier>), // Vec of Account Identifiers since a hardware wallet could theoretically be shared between multiple accounts
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

#[derive(Copy, Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub enum TransactionType {
    Burn,
    Mint,
    Transfer,
    Approve,
    TransferFrom,
    StakeNeuronNotification,
    CreateCanister,
    TopUpCanister(CanisterId),
    ParticipateSwap(CanisterId),
}

#[derive(Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct NeuronDetails {
    account_identifier: AccountIdentifier,
    principal: PrincipalId,
    memo: Memo,
    neuron_id: Option<NeuronId>,
}

#[derive(CandidType)]
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

#[derive(CandidType)]
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
    /// Determines whether a migration is being performed.
    #[must_use]
    pub fn migration_in_progress(&self) -> bool {
        self.accounts_db.migration_in_progress()
    }
    /// Advances the migration by one step.
    ///
    /// Note: This is a pass-through to the underlying `AccountsDb::step_migration`.  Please see that for further details.
    pub fn step_migration(&mut self, step_size: u32) {
        self.accounts_db.step_migration(step_size);
    }
    #[must_use]
    pub fn get_account(&self, caller: PrincipalId) -> Option<AccountDetails> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
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
        if let Some(account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            if account.principal.is_none() {
                // This is an old account that needs a one-off fix to set the principal and update the transactions.
                let mut account = account.clone();
                account.principal = Some(caller);
                self.accounts_db
                    .db_insert_account(&account_identifier.to_vec(), account);
            }
            false
        } else {
            let new_account = Account::new(caller, account_identifier);
            self.accounts_db
                .db_insert_account(&account_identifier.to_vec(), new_account);

            true
        }
    }

    /// Creates a sub-account for the given user.
    pub fn create_sub_account(&mut self, caller: PrincipalId, sub_account_name: String) -> CreateSubAccountResponse {
        self.assert_account_limit();
        let account_identifier = AccountIdentifier::from(caller);

        if !Self::validate_account_name(&sub_account_name) {
            CreateSubAccountResponse::NameTooLong
        } else if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            let response = if let Some(sub_account_id) = (1..u8::MAX).find(|i| !account.sub_accounts.contains_key(i)) {
                let sub_account = convert_byte_to_sub_account(sub_account_id);
                let sub_account_identifier = AccountIdentifier::new(caller, Some(sub_account));
                let named_sub_account = NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);

                account.sub_accounts.insert(sub_account_id, named_sub_account);
                self.accounts_db
                    .db_insert_account(&account_identifier.to_vec(), account);

                CreateSubAccountResponse::Ok(SubAccountDetails {
                    name: sub_account_name,
                    sub_account,
                    account_identifier: sub_account_identifier,
                })
            } else {
                CreateSubAccountResponse::SubAccountLimitExceeded
            };

            if let CreateSubAccountResponse::Ok(SubAccountDetails {
                name: _,
                sub_account,
                account_identifier: sub_account_identifier,
            }) = response
            {
                let sub_account_id = sub_account.0[31];
                self.hardware_wallets_and_sub_accounts.insert(
                    sub_account_identifier,
                    AccountWrapper::SubAccount(account_identifier, sub_account_id),
                );
                self.accounts_db_stats.sub_accounts_count += 1;
            }

            response
        } else {
            CreateSubAccountResponse::AccountNotFound
        }
    }

    pub fn rename_sub_account(
        &mut self,
        caller: PrincipalId,
        request: RenameSubAccountRequest,
    ) -> RenameSubAccountResponse {
        let account_identifier = AccountIdentifier::from(caller).to_vec();

        if !Self::validate_account_name(&request.new_name) {
            RenameSubAccountResponse::NameTooLong
        } else if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) {
            if let Some(sub_account) = account
                .sub_accounts
                .values_mut()
                .find(|sub_account| sub_account.account_identifier == request.account_identifier)
            {
                sub_account.name = request.new_name;
                self.accounts_db.db_insert_account(&account_identifier, account);
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
        } else if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier.to_vec()).clone() {
            let hardware_wallet_account_identifier = AccountIdentifier::from(request.principal);

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
                self.accounts_db
                    .db_insert_account(&account_identifier.to_vec(), account);

                self.accounts_db_stats.hardware_wallet_accounts_count += 1;
                self.link_hardware_wallet_to_account(account_identifier, hardware_wallet_account_identifier);
                RegisterHardwareWalletResponse::Ok
            }
        } else {
            RegisterHardwareWalletResponse::AccountNotFound
        }
    }

    pub fn maybe_process_transaction(
        &mut self,
        transfer: &Operation,
        memo: Memo,
        block_height: BlockIndex,
    ) -> Result<(), String> {
        if let Some(block_height_synced_up_to) = self.get_block_height_synced_up_to() {
            let expected_block_height = block_height_synced_up_to + 1;
            if block_height != block_height_synced_up_to + 1 {
                return Err(format!(
                    "Expected block height {expected_block_height}. Got block height {block_height}",
                ));
            }
        }

        match *transfer {
            Burn { .. } | Mint { .. } | Approve { .. } => {}
            Transfer {
                from,
                to,
                spender: _,
                amount: _,
                fee: _,
            } => {
                let default_transaction_type = if matches!(transfer, Transfer { .. }) {
                    TransactionType::Transfer
                } else {
                    TransactionType::TransferFrom
                };

                if self.store_has_account(to) {
                } else if self.store_has_account(from) {
                    if let Some(principal) = self.try_get_principal(&from) {
                        let canister_ids: Vec<CanisterId> =
                            self.get_canisters(principal).iter().map(|c| c.canister_id).collect();
                        let transaction_type = Self::get_transaction_type(
                            from,
                            to,
                            memo,
                            &principal,
                            &canister_ids,
                            default_transaction_type,
                        );
                        self.process_transaction_type(transaction_type, principal, from, to, block_height);
                    }
                }
            }
        }

        self.block_height_synced_up_to = Some(block_height);

        Ok(())
    }

    pub fn mark_ledger_sync_complete(&mut self) {
        self.last_ledger_sync_timestamp_nanos = u64::try_from(
            dfn_core::api::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_else(|err| unreachable!("The current time is well after the Unix epoch. Error: {err}"))
                .as_nanos(),
        )
        .unwrap_or_else(|_| unreachable!("Not impossible, but centuries in the future"));
    }

    /// Initializes the `block_height_synced_up_to` value.
    ///
    /// # Panics
    /// - Panics if the `block_height_synced_up_to` value has already been initialized.
    pub fn init_block_height_synced_up_to(&mut self, block_height: BlockIndex) {
        assert!(
            self.block_height_synced_up_to.is_none(),
            "This can only be called to initialize the 'block_height_synced_up_to' value"
        );

        self.block_height_synced_up_to = Some(block_height);
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
        if Self::validate_canister_name(&request.name) {
            let account_identifier = AccountIdentifier::from(caller).to_vec();

            if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) {
                let mut index_to_remove: Option<usize> = None;
                for (index, c) in account.canisters.iter().enumerate() {
                    if !request.name.is_empty() && c.name == request.name {
                        return AttachCanisterResponse::NameAlreadyTaken;
                    }
                    // The periodic_task_runner might attach the canister before this call.
                    // The canister attached by the periodic_task_runner has name `""`
                    if c.canister_id == request.canister_id {
                        if c.name.is_empty() && !request.name.is_empty() {
                            index_to_remove = Some(index);
                        } else {
                            return AttachCanisterResponse::CanisterAlreadyAttached;
                            // Note: It might be nice to tell the user the name of the existing canister.
                        }
                    }
                }

                if let Some(index) = index_to_remove {
                    // Remove the previous attached canister before reattaching.
                    account.canisters.remove(index);
                }

                if account.canisters.len() >= u8::MAX as usize {
                    return AttachCanisterResponse::CanisterLimitExceeded;
                }
                account.canisters.push(NamedCanister {
                    name: request.name,
                    canister_id: request.canister_id,
                });
                account.canisters.sort();

                self.accounts_db.db_insert_account(&account_identifier, account);

                AttachCanisterResponse::Ok
            } else {
                AttachCanisterResponse::AccountNotFound
            }
        } else {
            AttachCanisterResponse::NameTooLong
        }
    }

    pub fn rename_canister(&mut self, caller: PrincipalId, request: RenameCanisterRequest) -> RenameCanisterResponse {
        if Self::validate_canister_name(&request.name) {
            let account_identifier = AccountIdentifier::from(caller).to_vec();

            if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) {
                if !request.name.is_empty() && account.canisters.iter().any(|c| c.name == request.name) {
                    return RenameCanisterResponse::NameAlreadyTaken;
                }

                if let Some(index) = Self::find_canister_index(&account, request.canister_id) {
                    account.canisters.remove(index);
                    account.canisters.push(NamedCanister {
                        name: request.name,
                        canister_id: request.canister_id,
                    });
                    account.canisters.sort();
                    self.accounts_db.db_insert_account(&account_identifier, account);
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

        if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) {
            if let Some(index) = Self::find_canister_index(&account, request.canister_id) {
                account.canisters.remove(index);
                self.accounts_db.db_insert_account(&account_identifier, account);
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
        if let Some(account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            account.canisters.clone()
        } else {
            Vec::new()
        }
    }

    // We skip the checks here since in this scenario we must store the canister otherwise the user
    // won't be able to retrieve its Id.
    pub fn attach_newly_created_canister(&mut self, principal: PrincipalId, canister_id: CanisterId) {
        let account_identifier = AccountIdentifier::from(principal).to_vec();

        if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) {
            // We only attach if it doesn't already exist
            if Self::find_canister_index(&account, canister_id).is_none() {
                account.canisters.push(NamedCanister {
                    name: String::new(),
                    canister_id,
                });
                account.canisters.sort();
                self.accounts_db.db_insert_account(&account_identifier, account);
            }
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
        let Some(mut account) = self.accounts_db.db_get_account(&account_identifier) else {
            return SetImportedTokensResponse::AccountNotFound;
        };

        account.imported_tokens = Some(new_imported_tokens);

        self.accounts_db.db_insert_account(&account_identifier, account);
        SetImportedTokensResponse::Ok
    }

    pub fn get_imported_tokens(&mut self, caller: PrincipalId) -> GetImportedTokensResponse {
        let account_identifier = AccountIdentifier::from(caller).to_vec();
        let Some(account) = self.accounts_db.db_get_account(&account_identifier) else {
            return GetImportedTokensResponse::AccountNotFound;
        };

        GetImportedTokensResponse::Ok(account.imported_tokens.unwrap_or_default())
    }

    #[must_use]
    pub fn get_block_height_synced_up_to(&self) -> Option<BlockIndex> {
        self.block_height_synced_up_to
    }

    pub fn try_take_next_transaction_to_process(&mut self) -> Option<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        self.multi_part_transactions_processor.take_next()
    }

    pub fn enqueue_multi_part_transaction(
        &mut self,
        block_height: BlockIndex,
        transaction: MultiPartTransactionToBeProcessed,
    ) {
        self.multi_part_transactions_processor.push(block_height, transaction);
    }

    pub fn get_stats(&self, stats: &mut Stats) {
        let timestamp_now_nanos = u64::try_from(
            dfn_core::api::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_else(|err| unreachable!("Hey, we are back in the sixties!  Seriously, if we get here, the system time is before the Unix epoch.  This should be impossible.  Error: {err}"))
                .as_nanos(),
        )
        .unwrap_or_else(|_| {
            unreachable!("Well, this could kill us if the code is still running in 500 years.  Not impossible.")
        });
        let duration_since_last_sync =
            Duration::from_nanos(timestamp_now_nanos - self.last_ledger_sync_timestamp_nanos);

        stats.accounts_count = self.accounts_db.db_accounts_len();
        stats.sub_accounts_count = self.accounts_db_stats.sub_accounts_count;
        stats.hardware_wallet_accounts_count = self.accounts_db_stats.hardware_wallet_accounts_count;
        stats.block_height_synced_up_to = self.block_height_synced_up_to;
        stats.seconds_since_last_ledger_sync = duration_since_last_sync.as_secs();
        stats.neurons_created_count = self.neuron_accounts.len() as u64;
        stats.neurons_topped_up_count = self.neurons_topped_up_count;
        stats.transactions_to_process_queue_length = self.multi_part_transactions_processor.get_queue_length();
        stats.migration_countdown = Some(self.accounts_db.migration_countdown());
        stats.accounts_db_stats_recomputed_on_upgrade = self.accounts_db_stats_recomputed_on_upgrade.0;
    }

    #[must_use]
    pub fn get_histogram(&self) -> AccountsStoreHistogram {
        self.accounts_db
            .values()
            .fold(AccountsStoreHistogram::default(), |histogram, account| {
                histogram + &account
            })
    }

    fn store_has_account(&mut self, account_identifier: AccountIdentifier) -> bool {
        self.accounts_db.db_get_account(&account_identifier.to_vec()).is_some()
            || self.hardware_wallets_and_sub_accounts.contains_key(&account_identifier)
    }

    fn try_get_principal(&self, account_identifier: &AccountIdentifier) -> Option<PrincipalId> {
        if let Some(account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            account.principal
        } else {
            match self.hardware_wallets_and_sub_accounts.get(account_identifier) {
                Some(AccountWrapper::SubAccount(account_identifier, _)) => {
                    let account = self.accounts_db
                        .db_get_account
                        (&account_identifier.to_vec())
                        .unwrap_or_else(|| panic!("BROKEN STATE: Account identifier {account_identifier} exists in `hardware_wallets_and_sub_accounts`, but not in `accounts`."));
                    account.principal
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => linked_account_identifiers
                    .iter()
                    .filter_map(|account_identifier| self.accounts_db.db_get_account(&account_identifier.to_vec()))
                    .find_map(|a| {
                        a.hardware_wallet_accounts
                            .iter()
                            .find(|hw| *account_identifier == AccountIdentifier::from(hw.principal))
                            .map(|hw| hw.principal)
                    }),
                None => None,
            }
        }
    }

    fn link_hardware_wallet_to_account(
        &mut self,
        account_identifier: AccountIdentifier,
        hardware_wallet_account_identifier: AccountIdentifier,
    ) {
        self.hardware_wallets_and_sub_accounts
            .entry(hardware_wallet_account_identifier)
            .and_modify(|account_wrapper| {
                if let AccountWrapper::HardwareWallet(account_identifiers) = account_wrapper {
                    account_identifiers.push(account_identifier);
                }
            })
            .or_insert_with(|| AccountWrapper::HardwareWallet(vec![account_identifier]));
    }

    fn validate_account_name(name: &str) -> bool {
        const ACCOUNT_NAME_MAX_LENGTH: usize = 24;

        name.len() <= ACCOUNT_NAME_MAX_LENGTH
    }

    fn validate_canister_name(name: &str) -> bool {
        const CANISTER_NAME_MAX_LENGTH: usize = 24;

        name.len() <= CANISTER_NAME_MAX_LENGTH
    }

    #[allow(clippy::too_many_arguments)]
    fn get_transaction_type(
        from: AccountIdentifier,
        to: AccountIdentifier,
        memo: Memo,
        principal: &PrincipalId,
        canister_ids: &[CanisterId],
        default_transaction_type: TransactionType,
    ) -> TransactionType {
        // In case of the edge case that it's a transaction to itself
        // use the default value passed when the function is called
        if from == to {
            default_transaction_type
        } else if memo.0 > 0 {
            if Self::is_create_canister_transaction(memo, &to, principal) {
                TransactionType::CreateCanister
            } else if let Some(canister_id) = Self::is_topup_canister_transaction(memo, &to, canister_ids) {
                TransactionType::TopUpCanister(canister_id)
            } else {
                default_transaction_type
            }
        } else {
            default_transaction_type
        }
    }

    fn is_create_canister_transaction(memo: Memo, to: &AccountIdentifier, principal: &PrincipalId) -> bool {
        // Creating a canister involves sending ICP directly to an account controlled by the CMC, the NNS
        // Dapp canister then notifies the CMC of the transfer.
        if memo == MEMO_CREATE_CANISTER {
            let subaccount = principal.into();
            // Check if sent to CMC account for this principal
            let expected_to = AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount));
            if *to == expected_to {
                return true;
            }
        }
        false
    }

    fn is_topup_canister_transaction(
        memo: Memo,
        to: &AccountIdentifier,
        canister_ids: &[CanisterId],
    ) -> Option<CanisterId> {
        // Topping up a canister involves sending ICP directly to an account controlled by the CMC, the NNS
        // Dapp canister then notifies the CMC of the transfer.
        if memo == MEMO_TOP_UP_CANISTER {
            for canister_id in canister_ids {
                let subaccount = (&canister_id.get()).into();
                // Check if sent to CMC account for this canister
                let expected_to = AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount));
                if *to == expected_to {
                    return Some(*canister_id);
                }
            }
        }
        None
    }

    /// Certain transaction types require additional processing (Stake Neuron, Create Canister,
    /// etc). Each time we detect one of these transaction types we need to add the details to the
    /// `multi_part_transactions_processor` which will work through the required actions in the
    /// background.
    #[allow(clippy::too_many_arguments)]
    fn process_transaction_type(
        &mut self,
        transaction_type: TransactionType,
        principal: PrincipalId,
        from: AccountIdentifier,
        to: AccountIdentifier,
        block_height: BlockIndex,
    ) {
        match transaction_type {
            TransactionType::ParticipateSwap(swap_canister_id) => {
                self.multi_part_transactions_processor.push(
                    block_height,
                    MultiPartTransactionToBeProcessed::ParticipateSwap(principal, from, to, swap_canister_id),
                );
            }
            TransactionType::CreateCanister => {
                self.multi_part_transactions_processor.push(
                    block_height,
                    MultiPartTransactionToBeProcessed::CreateCanisterV2(principal),
                );
            }
            TransactionType::TopUpCanister(canister_id) => {
                self.multi_part_transactions_processor.push(
                    block_height,
                    MultiPartTransactionToBeProcessed::TopUpCanisterV2(principal, canister_id),
                );
            }
            _ => {}
        };
    }
    fn assert_account_limit(&self) {
        let db_accounts_len = self.accounts_db.db_accounts_len();
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
            &self.hardware_wallets_and_sub_accounts,
            // TODO: Remove pending_transactions
            HashMap::<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>::new(),
            // Transactions are unused but we need to encode them for backwards
            // compatibility.
            VecDeque::<candid::Empty>::new(),
            &self.neuron_accounts,
            &self.block_height_synced_up_to,
            &self.multi_part_transactions_processor,
            &self.last_ledger_sync_timestamp_nanos,
            &self.neurons_topped_up_count,
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
            mut hardware_wallets_and_sub_accounts,
            pending_transactions,
            // Transactions are unused but we need to decode something for backwards
            // compatibility.
            _transactions,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
            last_ledger_sync_timestamp_nanos,
            neurons_topped_up_count,
            accounts_db_stats_maybe,
        ): (
            candid::Reserved,
            HashMap<AccountIdentifier, AccountWrapper>,
            HashMap<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>,
            candid::Reserved,
            HashMap<AccountIdentifier, NeuronDetails>,
            Option<BlockIndex>,
            MultiPartTransactionsProcessor,
            u64,
            u64,
            Option<AccountsDbStats>,
        ) = Candid::from_bytes(bytes).map(|c| c.0)?;

        // Remove duplicate links between hardware wallets and user accounts
        for hw_or_sub in hardware_wallets_and_sub_accounts.values_mut() {
            if let AccountWrapper::HardwareWallet(ids) = hw_or_sub {
                let mut unique = HashSet::new();
                ids.retain(|id| unique.insert(*id));
            }
        }

        let accounts_db_stats_recomputed_on_upgrade = IgnoreEq(Some(accounts_db_stats_maybe.is_none()));
        let Some(accounts_db_stats) = accounts_db_stats_maybe else {
            return Err("Accounts DB stats should be present since the stable structures migration.".to_string());
        };

        Ok(AccountsStore {
            // Because the stable structures migration is finished, accounts_db
            // will be replaced with an AccountsDbAsUnboundedStableBTreeMap in
            // State::from(Partitions) so it doesn't matter what we set here.
            accounts_db: AccountsDbAsProxy::default(),
            hardware_wallets_and_sub_accounts,
            pending_transactions,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
            accounts_db_stats,
            accounts_db_stats_recomputed_on_upgrade,
            last_ledger_sync_timestamp_nanos,
            neurons_topped_up_count,
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
