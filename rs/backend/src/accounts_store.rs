//! User accounts and transactions.
use crate::constants::{MEMO_CREATE_CANISTER, MEMO_TOP_UP_CANISTER};
use crate::multi_part_transactions_processor::{MultiPartTransactionToBeProcessed, MultiPartTransactionsProcessor};
use crate::state::StableState;
use crate::stats::Stats;
use candid::CandidType;
use dfn_candid::Candid;
use histogram::AccountsStoreHistogram;
use ic_base_types::{CanisterId, PrincipalId};
use ic_cdk::println;
use ic_crypto_sha::Sha256;
use ic_ledger_core::timestamp::TimeStamp;
use ic_ledger_core::tokens::SignedTokens;
use ic_nns_common::types::NeuronId;
use ic_nns_constants::{CYCLES_MINTING_CANISTER_ID, GOVERNANCE_CANISTER_ID};
use ic_stable_structures::{storable::Bound, Storable};
use icp_ledger::Operation::{self, Approve, Burn, Mint, Transfer, TransferFrom};
use icp_ledger::{AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens};
use itertools::Itertools;
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::borrow::Cow;
use std::cmp::{min, Ordering};
use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use std::fmt;
use std::ops::{RangeBounds, RangeTo};
use std::time::{Duration, SystemTime};

pub mod constructors;
pub mod histogram;
pub mod schema;
use schema::{
    map::AccountsDbAsMap,
    proxy::{AccountsDb, AccountsDbAsProxy},
    AccountsDbBTreeMapTrait, AccountsDbTrait,
};

use self::schema::SchemaLabel;

type TransactionIndex = u64;

/// The data migration is more complicated if there are too many accounts.  With below this many
/// accounts we avoid some complications.
const PRE_MIGRATION_LIMIT: u64 = 300_000;

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

    transactions: VecDeque<Transaction>,
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
            "AccountsStore{{accounts_db: {:?}, hardware_wallets_and_sub_accounts: HashMap[{:?}], pending_transactions: HashMap[{:?}], transactions: VecDeque[{:?}], neuron_accounts: HashMap[{:?}], block_height_synced_up_to: {:?}, multi_part_transactions_processor: {:?}, accounts_db_stats: {:?}, last_ledger_sync_timestamp_nanos: {:?}, neurons_topped_up_count: {:?}}}",
            self.accounts_db,
            self.hardware_wallets_and_sub_accounts.len(),
            self.pending_transactions.len(),
            self.transactions.len(),
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
    fn schema_label(&self) -> SchemaLabel {
        self.accounts_db.schema_label()
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
    default_account_transactions: Vec<TransactionIndex>,
    sub_accounts: HashMap<u8, NamedSubAccount>,
    hardware_wallet_accounts: Vec<NamedHardwareWalletAccount>,
    canisters: Vec<NamedCanister>,
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
    transactions: Vec<TransactionIndex>,
}

#[derive(CandidType, Deserialize, Debug, Eq, PartialEq, Clone)]
struct NamedHardwareWalletAccount {
    name: String,
    principal: PrincipalId,
    transactions: Vec<TransactionIndex>,
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

#[derive(CandidType, Deserialize, Debug, Eq, PartialEq)]
struct Transaction {
    transaction_index: TransactionIndex,
    block_height: BlockIndex,
    timestamp: TimeStamp,
    memo: Memo,
    transfer: Operation,
    transaction_type: Option<TransactionType>,
}

#[derive(Copy, Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct CreateCanisterArgs {
    pub controller: PrincipalId,
    pub amount: Tokens,
    pub refund_address: AccountIdentifier,
}

#[derive(Copy, Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct TopUpCanisterArgs {
    pub principal: PrincipalId,
    pub canister_id: CanisterId,
    pub amount: Tokens,
    pub refund_address: AccountIdentifier,
}

#[derive(Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct RefundTransactionArgs {
    pub recipient_principal: PrincipalId,
    pub from_sub_account: Subaccount,
    pub amount: Tokens,
    pub original_transaction_block_height: BlockIndex,
    pub refund_address: AccountIdentifier,
    pub error_message: String,
}

#[derive(Copy, Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub enum TransactionType {
    Burn,
    Mint,
    Transfer,
    Approve,
    TransferFrom,
    StakeNeuron,
    StakeNeuronNotification,
    TopUpNeuron,
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
    /// Starts migrating accounts to the new db.
    pub fn start_migrating_accounts_to(&mut self, accounts_db: AccountsDb) {
        self.accounts_db.start_migrating_accounts_to(accounts_db);
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
        self.assert_pre_migration_limit();
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            if account.principal.is_none() {
                // This is an old account that needs a one-off fix to set the principal and update the transactions.
                let mut account = account.clone();
                account.principal = Some(caller);
                self.fix_transactions_for_early_user(&account, caller);
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

    /// Migrates transactions for users who were created before we started storing the principal.
    ///
    /// TODO: Monitor how many accounts still need to be migrated and remove this function when the number is 0.
    fn fix_transactions_for_early_user(&mut self, account: &Account, caller: PrincipalId) {
        let canister_ids: Vec<dfn_core::CanisterId> = account.canisters.iter().map(|c| c.canister_id).collect();
        let transactions: Vec<TransactionIndex> = account.get_all_transactions_linked_to_principal_sorted();

        // Now that we know the principal we can set the transaction types. The
        // transactions must be sorted since some transaction types can only be
        // determined based on earlier transactions (eg. we can only detect
        // TopUpNeuron transactions that happen after StakeNeuron transactions).
        for transaction_index in transactions {
            let transaction = self.get_transaction(transaction_index).unwrap();
            if transaction.transaction_type.is_none() {
                let transaction_type = match transaction.transfer {
                    Burn { from: _, amount: _ } => TransactionType::Burn,
                    Mint { to: _, amount: _ } => TransactionType::Mint,
                    Transfer {
                        from,
                        to,
                        amount,
                        fee: _,
                    }
                    | TransferFrom {
                        spender: _,
                        from,
                        to,
                        amount,
                        fee: _,
                    } => {
                        let default_transaction_type = if matches!(transaction.transfer, Transfer { .. }) {
                            TransactionType::Transfer
                        } else {
                            TransactionType::TransferFrom
                        };

                        if self.accounts_db.db_get_account(&to.to_vec()).is_some() {
                            // If the recipient is a known account then the transaction must be either Transfer or TransferFrom,
                            // since for all the 'special' transaction types the recipient is not a user account
                            default_transaction_type
                        } else {
                            let memo = transaction.memo;
                            let transaction_type = self.get_transaction_type(
                                from,
                                to,
                                amount,
                                memo,
                                &caller,
                                &canister_ids,
                                default_transaction_type,
                            );
                            let block_height = transaction.block_height;
                            self.process_transaction_type(
                                transaction_type,
                                caller,
                                from,
                                to,
                                memo,
                                amount,
                                block_height,
                            );
                            transaction_type
                        }
                    }
                    Approve { .. } => TransactionType::Approve,
                };
                self.get_transaction_mut(transaction_index).unwrap().transaction_type = Some(transaction_type);
            }
        }
    }

    /// Creates a sub-account for the given user.
    pub fn create_sub_account(&mut self, caller: PrincipalId, sub_account_name: String) -> CreateSubAccountResponse {
        self.assert_pre_migration_limit();
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
                    transactions: Vec::new(),
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

    pub fn append_transaction(
        &mut self,
        transfer: Operation,
        memo: Memo,
        block_height: BlockIndex,
        timestamp: TimeStamp,
    ) -> Result<bool, String> {
        if let Some(block_height_synced_up_to) = self.get_block_height_synced_up_to() {
            let expected_block_height = block_height_synced_up_to + 1;
            if block_height != block_height_synced_up_to + 1 {
                return Err(format!(
                    "Expected block height {expected_block_height}. Got block height {block_height}",
                ));
            }
        }

        let transaction_index = self.get_next_transaction_index();
        let mut should_store_transaction = false;
        let mut transaction_type: Option<TransactionType> = None;

        match transfer {
            Burn { from, amount: _ } => {
                if self.try_add_transaction_to_account(from, transaction_index) {
                    should_store_transaction = true;
                    transaction_type = Some(TransactionType::Burn);
                }
            }
            Mint { to, amount: _ } => {
                if self.try_add_transaction_to_account(to, transaction_index) {
                    should_store_transaction = true;
                    transaction_type = Some(TransactionType::Mint);
                }
            }
            Transfer {
                from,
                to,
                amount,
                fee: _,
            }
            | TransferFrom {
                from,
                to,
                spender: _,
                amount,
                fee: _,
            } => {
                let default_transaction_type = if matches!(transfer, Transfer { .. }) {
                    TransactionType::Transfer
                } else {
                    TransactionType::TransferFrom
                };

                if self.try_add_transaction_to_account(to, transaction_index) {
                    self.try_add_transaction_to_account(from, transaction_index);
                    should_store_transaction = true;
                    transaction_type = Some(default_transaction_type);
                } else if self.try_add_transaction_to_account(from, transaction_index) {
                    should_store_transaction = true;
                    if let Some(principal) = self.try_get_principal(&from) {
                        let canister_ids: Vec<CanisterId> =
                            self.get_canisters(principal).iter().map(|c| c.canister_id).collect();
                        transaction_type = Some(self.get_transaction_type(
                            from,
                            to,
                            amount,
                            memo,
                            &principal,
                            &canister_ids,
                            default_transaction_type,
                        ));
                        self.process_transaction_type(
                            transaction_type
                                .unwrap_or_else(|| unreachable!("Transaction type is set to Some a few lines above")),
                            principal,
                            from,
                            to,
                            memo,
                            amount,
                            block_height,
                        );
                    }
                } else if let Some(neuron_details) = self.neuron_accounts.get(&to) {
                    // Handle the case where people top up their neuron from an external account
                    self.multi_part_transactions_processor.push(
                        block_height,
                        MultiPartTransactionToBeProcessed::TopUpNeuron(neuron_details.principal, neuron_details.memo),
                    );
                }
            }
            Approve { .. } => {} // TODO do we want to show Approvals in the NNS Dapp?
        }

        if should_store_transaction {
            self.transactions.push_back(Transaction::new(
                transaction_index,
                block_height,
                timestamp,
                memo,
                transfer,
                transaction_type,
            ));
        }

        self.block_height_synced_up_to = Some(block_height);

        Ok(should_store_transaction)
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

    /// Gets all the transactions to or from the caller.
    #[must_use]
    #[allow(clippy::needless_pass_by_value)] // The pattern is to pass a request by value.
    pub fn get_transactions(&self, caller: PrincipalId, request: GetTransactionsRequest) -> GetTransactionsResponse {
        let account_identifier = AccountIdentifier::from(caller);
        let empty_transaction_response = GetTransactionsResponse {
            transactions: vec![],
            total: 0,
        };

        let account = self.accounts_db.db_get_account(&account_identifier.to_vec());
        let transactions: &Vec<u64> = match &account {
            None => {
                return empty_transaction_response;
            }
            Some(account) => {
                if account_identifier == request.account_identifier {
                    &account.default_account_transactions
                } else if let Some(hardware_wallet_account) = account
                    .hardware_wallet_accounts
                    .iter()
                    .find(|a| request.account_identifier == AccountIdentifier::from(a.principal))
                {
                    &hardware_wallet_account.transactions
                } else if let Some(sub_account) = account
                    .sub_accounts
                    .values()
                    .find(|a| a.account_identifier == request.account_identifier)
                {
                    &sub_account.transactions
                } else {
                    return empty_transaction_response;
                }
            }
        };

        let results: Vec<TransactionResult> = transactions
            .iter()
            .rev()
            .skip(request.offset as usize)
            .take(request.page_size as usize)
            .map(|transaction_index| {
                let transaction = self.get_transaction(*transaction_index).unwrap_or_else(|| {
                    unreachable!(
                        "If transaction {transaction_index} is in the list for user {caller}, it must also be in the global transaction list."
                    )
                });
                let transaction_type = transaction.transaction_type;
                let used_transaction_type = if let Some(TransactionType::TransferFrom) = transaction_type {
                    Some(TransactionType::Transfer)
                } else {
                    transaction_type
                };

                TransactionResult {
                    block_height: transaction.block_height,
                    timestamp: transaction.timestamp,
                    memo: transaction.memo,
                    transfer: match transaction.transfer {
                        Burn { amount, from: _ } => TransferResult::Burn { amount },
                        Mint { amount, to: _ } => TransferResult::Mint { amount },
                        Transfer { from, to, amount, fee }
                        | TransferFrom {
                            from,
                            to,
                            spender: _,
                            amount,
                            fee,
                        } => {
                            if from == request.account_identifier {
                                TransferResult::Send { to, amount, fee }
                            } else {
                                TransferResult::Receive { from, amount, fee }
                            }
                        }
                        Approve {
                            from,
                            spender,
                            allowance,
                            expires_at,
                            fee,
                        } => TransferResult::Approve {
                            from,
                            spender,
                            allowance,
                            expires_at,
                            fee,
                        },
                    },
                    transaction_type: used_transaction_type,
                }
            })
            .collect();

        GetTransactionsResponse {
            transactions: results,
            total: u32::try_from(transactions.len())
                .unwrap_or_else(|_| unreachable!("The number of transactions is well below u32")),
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

    pub fn enqueue_transaction_to_be_refunded(&mut self, args: RefundTransactionArgs) {
        self.multi_part_transactions_processor.push(
            args.original_transaction_block_height,
            MultiPartTransactionToBeProcessed::RefundTransaction(args),
        );
    }

    #[must_use]
    pub fn get_next_transaction_index(&self) -> TransactionIndex {
        match self.transactions.back() {
            Some(t) => t.transaction_index + 1,
            None => 0,
        }
    }

    #[must_use]
    pub fn get_block_height_synced_up_to(&self) -> Option<BlockIndex> {
        self.block_height_synced_up_to
    }

    pub fn try_take_next_transaction_to_process(&mut self) -> Option<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        self.multi_part_transactions_processor.take_next()
    }

    /// Records that a neuron has been created for the given account.
    ///
    /// # Panics
    /// - If the account does not exist.
    pub fn mark_neuron_created(&mut self, principal: &PrincipalId, memo: Memo, neuron_id: NeuronId) {
        let account_identifier = Self::generate_stake_neuron_address(principal, memo);
        self.neuron_accounts.get_mut(&account_identifier).unwrap_or_else(|| panic!("Failed to mark neuron created for account {account_identifier} as the account has no neuron_accounts entry.")).neuron_id = Some(neuron_id);
    }

    pub fn mark_neuron_topped_up(&mut self) {
        self.neurons_topped_up_count += 1;
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn get_transactions_count(&self) -> u32 {
        self.transactions.len() as u32
    }

    pub fn prune_transactions(&mut self, count_to_prune: u32) -> u32 {
        let count_to_prune = min(count_to_prune, u32::try_from(self.transactions.len()).unwrap_or_else(|_| unreachable!("The number of transactions is well below 2**32.  Transactions are pruned if the heap, where they are stored, exceeds 1Gb of data.")));

        if count_to_prune > 0 {
            let transactions: Vec<_> = self
                .transactions
                .drain(RangeTo {
                    end: count_to_prune as usize,
                })
                .collect();

            // Note: This SHOULD always be true, as transactions.len() should equal count_to_prune and we have already checked that that is greater than 0.
            if let Some(min_transaction_index) = self
                .transactions
                .front()
                .map(|transaction| transaction.transaction_index)
            {
                for transaction in transactions {
                    let accounts = match transaction.transfer {
                        Burn { from, amount: _ } => vec![from],
                        Mint { to, amount: _ } => vec![to],
                        Transfer {
                            from,
                            to,
                            amount: _,
                            fee: _,
                        }
                        | TransferFrom {
                            from,
                            to,
                            spender: _,
                            amount: _,
                            fee: _,
                        } => vec![from, to],
                        Approve { .. } => vec![],
                    };
                    for account in accounts {
                        self.prune_transactions_from_account(account, min_transaction_index);
                    }
                }
            }
        }

        count_to_prune
    }

    pub fn enqueue_multi_part_transaction(
        &mut self,
        block_height: BlockIndex,
        transaction: MultiPartTransactionToBeProcessed,
    ) {
        self.multi_part_transactions_processor.push(block_height, transaction);
    }

    pub fn get_stats(&self, stats: &mut Stats) {
        let earliest_transaction = self.transactions.front();
        let latest_transaction = self.transactions.back();
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
        stats.transactions_count = self.transactions.len() as u64;
        stats.block_height_synced_up_to = self.block_height_synced_up_to;
        stats.earliest_transaction_timestamp_nanos =
            earliest_transaction.map_or(0, |t| t.timestamp.as_nanos_since_unix_epoch());
        stats.earliest_transaction_block_height = earliest_transaction.map_or(0, |t| t.block_height);
        stats.latest_transaction_timestamp_nanos =
            latest_transaction.map_or(0, |t| t.timestamp.as_nanos_since_unix_epoch());
        stats.latest_transaction_block_height = latest_transaction.map_or(0, |t| t.block_height);
        stats.seconds_since_last_ledger_sync = duration_since_last_sync.as_secs();
        stats.neurons_created_count = self.neuron_accounts.len() as u64;
        stats.neurons_topped_up_count = self.neurons_topped_up_count;
        stats.transactions_to_process_queue_length = self.multi_part_transactions_processor.get_queue_length();
        stats.schema = Some(self.accounts_db.schema_label() as u32);
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

    fn try_add_transaction_to_account(
        &mut self,
        account_identifier: AccountIdentifier,
        transaction_index: TransactionIndex,
    ) -> bool {
        if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            account.append_default_account_transaction(transaction_index);
            self.accounts_db
                .db_insert_account(&account_identifier.to_vec(), account);
        } else {
            match self.hardware_wallets_and_sub_accounts.get(&account_identifier) {
                Some(AccountWrapper::SubAccount(parent_account_identifier, sub_account_index)) => {
                    let mut account = self
                        .accounts_db
                        .db_get_account(&parent_account_identifier.to_vec())
                        .unwrap();
                    account.append_sub_account_transaction(*sub_account_index, transaction_index);
                    self.accounts_db
                        .db_insert_account(&parent_account_identifier.to_vec(), account);
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => {
                    for linked_account_identifier in linked_account_identifiers {
                        let mut account = self
                            .accounts_db
                            .db_get_account(&linked_account_identifier.to_vec())
                            .unwrap();
                        account.append_hardware_wallet_transaction(account_identifier, transaction_index);
                        self.accounts_db
                            .db_insert_account(&linked_account_identifier.to_vec(), account);
                    }
                }
                None => return false,
            }
        }

        true
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

    fn get_transaction(&self, transaction_index: TransactionIndex) -> Option<&Transaction> {
        match self.transactions.front() {
            Some(t) => {
                if t.transaction_index > transaction_index {
                    None
                } else {
                    let offset = t.transaction_index;
                    self.transactions
                        .get(usize::try_from(transaction_index - offset).unwrap_or_else(|_| {
                            unreachable!("The number of transactions is far below the size of memory.")
                        }))
                }
            }
            None => None,
        }
    }

    fn get_transaction_mut(&mut self, transaction_index: TransactionIndex) -> Option<&mut Transaction> {
        match self.transactions.front() {
            Some(t) => {
                if t.transaction_index > transaction_index {
                    None
                } else {
                    let offset = t.transaction_index;
                    self.transactions.get_mut(
                        usize::try_from(transaction_index - offset).unwrap_or_else(|_| {
                            unreachable!("The number of transactions is far below the size of memory")
                        }),
                    )
                }
            }
            None => None,
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

    fn prune_transactions_from_account(
        &mut self,
        account_identifier: AccountIdentifier,
        prune_blocks_previous_to: TransactionIndex,
    ) {
        fn prune_transactions_impl(
            transactions: &mut Vec<TransactionIndex>,
            prune_blocks_previous_to: TransactionIndex,
        ) {
            let index = transactions
                .iter()
                .enumerate()
                .take_while(|(_, &block_height)| block_height < prune_blocks_previous_to)
                .map(|(index, _)| index)
                .last();

            if let Some(index) = index {
                transactions.drain(0..=index);
            }

            if transactions.capacity() >= transactions.len() * 2 {
                transactions.shrink_to_fit();
            }
        }

        if let Some(mut account) = self.accounts_db.db_get_account(&account_identifier.to_vec()) {
            let transactions = &mut account.default_account_transactions;
            prune_transactions_impl(transactions, prune_blocks_previous_to);
            self.accounts_db
                .db_insert_account(&account_identifier.to_vec(), account);
        } else {
            match self.hardware_wallets_and_sub_accounts.get(&account_identifier) {
                Some(AccountWrapper::SubAccount(parent_account_identifier, sub_account_index)) => {
                    let mut account = self
                        .accounts_db
                        .db_get_account(&parent_account_identifier.to_vec())
                        .unwrap();

                    if let Some(sub_account) = account.sub_accounts.get_mut(sub_account_index) {
                        let transactions = &mut sub_account.transactions;
                        prune_transactions_impl(transactions, prune_blocks_previous_to);
                    }

                    self.accounts_db
                        .db_insert_account(&parent_account_identifier.to_vec(), account);
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => {
                    for linked_account_identifier in linked_account_identifiers {
                        let mut account = self
                            .accounts_db
                            .db_get_account(&linked_account_identifier.to_vec())
                            .unwrap();
                        if let Some(hardware_wallet_account) = account
                            .hardware_wallet_accounts
                            .iter_mut()
                            .find(|a| account_identifier == AccountIdentifier::from(a.principal))
                        {
                            let transactions = &mut hardware_wallet_account.transactions;
                            prune_transactions_impl(transactions, prune_blocks_previous_to);
                            self.accounts_db
                                .db_insert_account(&linked_account_identifier.to_vec(), account);
                        }
                    }
                }
                None => {}
            }
        }
    }

    fn get_transaction_index(&self, block_height: BlockIndex) -> Option<TransactionIndex> {
        if let Some(latest_transaction) = self.transactions.back() {
            let max_block_height = latest_transaction.block_height;
            if block_height <= max_block_height {
                return self
                    .transactions
                    .binary_search_by_key(&block_height, |t| t.block_height)
                    .ok()
                    .map(|i| i as u64);
            }
        }
        None
    }

    #[allow(clippy::too_many_arguments)]
    fn get_transaction_type(
        &self,
        from: AccountIdentifier,
        to: AccountIdentifier,
        amount: Tokens,
        memo: Memo,
        principal: &PrincipalId,
        canister_ids: &[CanisterId],
        default_transaction_type: TransactionType,
    ) -> TransactionType {
        // In case of the edge case that it's a transaction to itself
        // use the default value passed when the function is called
        if from == to {
            default_transaction_type
        } else if self.neuron_accounts.contains_key(&to) {
            if self.is_stake_neuron_notification(memo, &from, &to, amount) {
                TransactionType::StakeNeuronNotification
            } else {
                TransactionType::TopUpNeuron
            }
        } else if memo.0 > 0 {
            if Self::is_create_canister_transaction(memo, &to, principal) {
                TransactionType::CreateCanister
            } else if let Some(canister_id) = Self::is_topup_canister_transaction(memo, &to, canister_ids) {
                TransactionType::TopUpCanister(canister_id)
            } else if Self::is_stake_neuron_transaction(memo, &to, principal) {
                TransactionType::StakeNeuron
            } else {
                default_transaction_type
            }
        } else {
            default_transaction_type
        }
    }

    fn is_create_canister_transaction(memo: Memo, to: &AccountIdentifier, principal: &PrincipalId) -> bool {
        // There are now 2 ways to create a canister.
        // The new way involves sending ICP directly to an account controlled by the CMC, the NNS
        // Dapp canister then notifies the CMC of the transfer.
        // The old way involves sending ICP to an account controlled by the NNS Dapp, the NNS Dapp
        // then forwards the ICP on to an account controlled by the CMC and calls notify on the
        // ledger which in turns notifies the CMC.
        if memo == MEMO_CREATE_CANISTER {
            let subaccount = principal.into();
            {
                // Check if sent to CMC account for this principal
                let expected_to = AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount));
                if *to == expected_to {
                    return true;
                }
            }
            {
                // Check if sent to NNS Dapp account for this principal
                let expected_to = AccountIdentifier::new(dfn_core::api::id().get(), Some(subaccount));
                if *to == expected_to {
                    return true;
                }
            }
        }
        false
    }

    fn is_topup_canister_transaction(
        memo: Memo,
        to: &AccountIdentifier,
        canister_ids: &[CanisterId],
    ) -> Option<CanisterId> {
        // There are now 2 ways to top up a canister.
        // The new way involves sending ICP directly to an account controlled by the CMC, the NNS
        // Dapp canister then notifies the CMC of the transfer.
        // The old way involves sending ICP to an account controlled by the NNS Dapp, the NNS Dapp
        // then forwards the ICP on to an account controlled by the CMC and calls notify on the
        // ledger which in turns notifies the CMC.
        if memo == MEMO_TOP_UP_CANISTER {
            for canister_id in canister_ids {
                let subaccount = (&canister_id.get()).into();
                {
                    // Check if sent to CMC account for this canister
                    let expected_to = AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount));
                    if *to == expected_to {
                        return Some(*canister_id);
                    }
                }
                {
                    // Check if sent to NNS Dapp account for this canister
                    let expected_to = AccountIdentifier::new(dfn_core::api::id().get(), Some(subaccount));
                    if *to == expected_to {
                        return Some(*canister_id);
                    }
                }
            }
        }
        None
    }

    fn is_stake_neuron_transaction(memo: Memo, to: &AccountIdentifier, principal: &PrincipalId) -> bool {
        if memo.0 > 0 {
            let expected_to = Self::generate_stake_neuron_address(principal, memo);
            *to == expected_to
        } else {
            false
        }
    }

    fn is_stake_neuron_notification(
        &self,
        memo: Memo,
        from: &AccountIdentifier,
        to: &AccountIdentifier,
        amount: Tokens,
    ) -> bool {
        if memo.0 > 0 && amount.get_e8s() == 0 {
            self.get_transaction_index(memo.0)
                .and_then(|index| self.get_transaction(index))
                .filter(|&t| {
                    t.transaction_type.is_some() && matches!(t.transaction_type.unwrap(), TransactionType::StakeNeuron)
                })
                .map_or(false, |t| {
                    if let Transfer {
                        from: original_transaction_from,
                        to: original_transaction_to,
                        amount: _,
                        fee: _,
                    } = t.transfer
                    {
                        from == &original_transaction_from && to == &original_transaction_to
                    } else {
                        false
                    }
                })
        } else {
            false
        }
    }

    fn generate_stake_neuron_address(principal: &PrincipalId, memo: Memo) -> AccountIdentifier {
        let subaccount = Subaccount({
            let mut state = Sha256::new();
            state.write(&[0x0c]);
            state.write(b"neuron-stake");
            state.write(principal.as_slice());
            state.write(&memo.0.to_be_bytes());
            state.finish()
        });
        AccountIdentifier::new(GOVERNANCE_CANISTER_ID.get(), Some(subaccount))
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
        memo: Memo,
        amount: Tokens,
        block_height: BlockIndex,
    ) {
        match transaction_type {
            TransactionType::ParticipateSwap(swap_canister_id) => {
                self.multi_part_transactions_processor.push(
                    block_height,
                    MultiPartTransactionToBeProcessed::ParticipateSwap(principal, from, to, swap_canister_id),
                );
            }
            TransactionType::StakeNeuron => {
                let neuron_details = NeuronDetails {
                    account_identifier: to,
                    principal,
                    memo,
                    neuron_id: None,
                };
                self.neuron_accounts.insert(to, neuron_details);
                self.multi_part_transactions_processor.push(
                    block_height,
                    MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo),
                );
            }
            TransactionType::TopUpNeuron => {
                if let Some(neuron_account) = self.neuron_accounts.get(&to) {
                    // We need to use the memo from the original stake neuron transaction
                    self.multi_part_transactions_processor.push(
                        block_height,
                        MultiPartTransactionToBeProcessed::TopUpNeuron(neuron_account.principal, neuron_account.memo),
                    );
                }
            }
            TransactionType::CreateCanister => {
                if to == AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some((&principal).into())) {
                    self.multi_part_transactions_processor.push(
                        block_height,
                        MultiPartTransactionToBeProcessed::CreateCanisterV2(principal),
                    );
                } else {
                    let args = CreateCanisterArgs {
                        controller: principal,
                        amount,
                        refund_address: from,
                    };
                    self.multi_part_transactions_processor
                        .push(block_height, MultiPartTransactionToBeProcessed::CreateCanister(args));
                }
            }
            TransactionType::TopUpCanister(canister_id) => {
                if to == AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some((&canister_id.get()).into())) {
                    self.multi_part_transactions_processor.push(
                        block_height,
                        MultiPartTransactionToBeProcessed::TopUpCanisterV2(principal, canister_id),
                    );
                } else {
                    let args = TopUpCanisterArgs {
                        principal,
                        canister_id,
                        amount,
                        refund_address: from,
                    };
                    self.multi_part_transactions_processor
                        .push(block_height, MultiPartTransactionToBeProcessed::TopUpCanister(args));
                }
            }
            _ => {}
        };
    }
    fn assert_pre_migration_limit(&self) {
        let db_accounts_len = self.accounts_db.db_accounts_len();
        assert!(
            db_accounts_len < PRE_MIGRATION_LIMIT,
            "Pre migration account limit exceeded {db_accounts_len}"
        );
    }
}

impl StableState for AccountsStore {
    fn encode(&self) -> Vec<u8> {
        let empty_accounts = BTreeMap::<Vec<u8>, Account>::new();
        Candid((
            &self.accounts_db.as_map_maybe().unwrap_or(&empty_accounts),
            &self.hardware_wallets_and_sub_accounts,
            // TODO: Remove pending_transactions
            HashMap::<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>::new(),
            &self.transactions,
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
            mut accounts,
            mut hardware_wallets_and_sub_accounts,
            pending_transactions,
            transactions,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
            last_ledger_sync_timestamp_nanos,
            neurons_topped_up_count,
            accounts_db_stats_maybe,
        ): (
            BTreeMap<Vec<u8>, Account>,
            HashMap<AccountIdentifier, AccountWrapper>,
            HashMap<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>,
            VecDeque<Transaction>,
            HashMap<AccountIdentifier, NeuronDetails>,
            Option<BlockIndex>,
            MultiPartTransactionsProcessor,
            u64,
            u64,
            Option<AccountsDbStats>,
        ) = Candid::from_bytes(bytes).map(|c| c.0)?;

        // Remove duplicate transactions from hardware wallet accounts
        for hw_account in accounts.values_mut().flat_map(|a| &mut a.hardware_wallet_accounts) {
            let mut unique = HashSet::new();
            hw_account.transactions.retain(|t| unique.insert(*t));
        }

        // Remove duplicate links between hardware wallets and user accounts
        for hw_or_sub in hardware_wallets_and_sub_accounts.values_mut() {
            if let AccountWrapper::HardwareWallet(ids) = hw_or_sub {
                let mut unique = HashSet::new();
                ids.retain(|id| unique.insert(*id));
            }
        }

        let accounts_db_stats_recomputed_on_upgrade = IgnoreEq(Some(accounts_db_stats_maybe.is_none()));
        let accounts_db_stats = accounts_db_stats_maybe.unwrap_or_else(|| {
            println!("Re-counting accounts_db stats...");
            let mut sub_accounts_count: u64 = 0;
            let mut hardware_wallet_accounts_count: u64 = 0;
            for account in accounts.values() {
                sub_accounts_count += account.sub_accounts.len() as u64;
                hardware_wallet_accounts_count += account.hardware_wallet_accounts.len() as u64;
            }
            AccountsDbStats {
                sub_accounts_count,
                hardware_wallet_accounts_count,
            }
        });

        let accounts_db = AccountsDb::Map(AccountsDbAsMap::from_map(accounts));

        Ok(AccountsStore {
            accounts_db: AccountsDbAsProxy::from(accounts_db),
            hardware_wallets_and_sub_accounts,
            pending_transactions,
            transactions,
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
            default_account_transactions: Vec::new(),
            sub_accounts: HashMap::new(),
            hardware_wallet_accounts: Vec::new(),
            canisters: Vec::new(),
        }
    }

    pub fn append_default_account_transaction(&mut self, transaction_index: TransactionIndex) {
        self.default_account_transactions.push(transaction_index);
    }

    /// Records a transaction in a sub-account.
    ///
    /// TODO: Once we use the ledger index canister, this can be deleted.
    ///
    /// # Panics
    /// - If we are unable to get a lock on the sub-accounts map.  This may happen if a previous update call locked the map, but has made an async call and so hasn't released the lock yet.
    pub fn append_sub_account_transaction(&mut self, sub_account: u8, transaction_index: TransactionIndex) {
        self.sub_accounts
            .get_mut(&sub_account)
            .expect("Unable to lock the sub-account transactions map")
            .transactions
            .push(transaction_index);
    }

    /// Records a transaction in a hardware wallet account.
    ///
    /// TODO: Use the index canister instead.
    ///
    /// # Panics
    /// - If the account does not have a hardware wallet sub-account with the given identifier.
    pub fn append_hardware_wallet_transaction(
        &mut self,
        account_identifier: AccountIdentifier,
        transaction_index: TransactionIndex,
    ) {
        let account = self
            .hardware_wallet_accounts
            .iter_mut()
            .find(|a| account_identifier == AccountIdentifier::from(a.principal))
            .expect("This account does not have a hardware wallet with the given identifier.");

        account.transactions.push(transaction_index);
    }

    #[must_use]
    pub fn get_all_transactions_linked_to_principal_sorted(&self) -> Vec<TransactionIndex> {
        self.default_account_transactions
            .iter()
            .copied()
            .chain(self.sub_accounts.values().flat_map(|a| a.transactions.iter().copied()))
            .sorted()
            .collect()
    }
}

impl Transaction {
    pub fn new(
        transaction_index: TransactionIndex,
        block_height: BlockIndex,
        timestamp: TimeStamp,
        memo: Memo,
        transfer: Operation,
        transaction_type: Option<TransactionType>,
    ) -> Transaction {
        Transaction {
            transaction_index,
            block_height,
            timestamp,
            memo,
            transfer,
            transaction_type,
        }
    }
}

impl NamedSubAccount {
    pub fn new(name: String, account_identifier: AccountIdentifier) -> NamedSubAccount {
        NamedSubAccount {
            name,
            account_identifier,
            transactions: Vec::new(),
        }
    }
}

fn convert_byte_to_sub_account(byte: u8) -> Subaccount {
    let mut bytes = [0u8; 32];
    bytes[31] = byte;
    Subaccount(bytes)
}

#[derive(CandidType, Deserialize)]
pub struct GetTransactionsRequest {
    account_identifier: AccountIdentifier,
    offset: u32,
    page_size: u8,
}

#[derive(CandidType)]
pub struct GetTransactionsResponse {
    transactions: Vec<TransactionResult>,
    total: u32,
}

#[derive(CandidType)]
pub struct TransactionResult {
    block_height: BlockIndex,
    timestamp: TimeStamp,
    memo: Memo,
    transfer: TransferResult,
    transaction_type: Option<TransactionType>,
}

#[derive(CandidType, Debug, PartialEq)]
pub enum TransferResult {
    Burn {
        amount: Tokens,
    },
    Mint {
        amount: Tokens,
    },
    Send {
        to: AccountIdentifier,
        amount: Tokens,
        fee: Tokens,
    },
    Receive {
        from: AccountIdentifier,
        amount: Tokens,
        fee: Tokens,
    },
    Approve {
        from: AccountIdentifier,
        spender: AccountIdentifier,
        allowance: SignedTokens,
        expires_at: Option<TimeStamp>,
        fee: Tokens,
    },
}

#[cfg(test)]
pub(crate) mod tests;
#[cfg(any(test, feature = "toy_data_gen"))]
pub(crate) mod toy_data;
