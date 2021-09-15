use crate::constants::{MEMO_CREATE_CANISTER, MEMO_TOP_UP_CANISTER};
use crate::multi_part_transactions_processor::{
    MultiPartTransactionError, MultiPartTransactionStatus, MultiPartTransactionToBeProcessed,
    MultiPartTransactionsProcessor,
};
use crate::state::StableState;
use candid::{CandidType, Encode};
use dfn_candid::Candid;
use ic_base_types::{CanisterId, PrincipalId};
use ic_certified_map::{leaf_hash, AsHashTree, Hash, HashTree, RbTree};
use ic_crypto_sha256::Sha256;
use ic_nns_common::types::NeuronId;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
use itertools::Itertools;
use ledger_canister::{
    AccountIdentifier, BlockHeight, ICPTs, Memo, Subaccount, TimeStamp,
    Transfer::{self, Burn, Mint, Send},
};
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::borrow::Cow;
use std::cmp::{min, Ordering};
use std::collections::{
    hash_map::Entry::{Occupied, Vacant},
    HashMap, VecDeque,
};
use std::iter::FromIterator;
use std::ops::RangeTo;
use std::time::{Duration, SystemTime};

type TransactionIndex = u64;

#[derive(Default)]
pub struct AccountsStore {
    #[allow(dead_code)]
    accounts_certifiable: RbTree<Vec<u8>, Account>,
    #[allow(dead_code)]
    transactions_certifiable: RbTree<Vec<u8>, TransactionWrapper>,
    #[allow(dead_code)]
    hardware_wallets_and_sub_accounts: HashMap<AccountIdentifier, AccountWrapper>,

    account_identifier_lookup: HashMap<AccountIdentifier, AccountLocation>,
    transactions: VecDeque<Transaction>,
    accounts: Vec<Option<Account>>,
    neuron_accounts: HashMap<AccountIdentifier, NeuronDetails>,
    block_height_synced_up_to: Option<BlockHeight>,
    multi_part_transactions_processor: MultiPartTransactionsProcessor,

    // Use these up first before appending to the accounts Vec
    empty_account_indices: Vec<u32>,

    accounts_count: u64,
    sub_accounts_count: u64,
    hardware_wallet_accounts_count: u64,
    last_ledger_sync_timestamp_nanos: u64,
    neurons_topped_up_count: u64,
}

#[derive(CandidType, Deserialize, Debug)]
enum AccountLocation {
    DefaultAccount(u32),      // Account index
    SubAccount(u32, u8),      // Account index + SubAccount index
    HardwareWallet(Vec<u32>), // Vec of account index since a hardware wallet could theoretically be shared between multiple accounts
}

#[allow(dead_code)]
enum AccountWrapper {
    SubAccount(AccountIdentifier, u8), // Account Identifier + SubAccount index
    HardwareWallet(Vec<AccountIdentifier>), // Vec of Account Identifiers since a hardware wallet could theoretically be shared between multiple accounts
}

#[derive(CandidType, Deserialize, Clone)]
struct Account {
    principal: Option<PrincipalId>,
    account_identifier: AccountIdentifier,
    default_account_transactions: Vec<TransactionIndex>,
    sub_accounts: HashMap<u8, NamedSubAccount>,
    hardware_wallet_accounts: Vec<NamedHardwareWalletAccount>,
    canisters: Vec<NamedCanister>,
}

#[derive(CandidType, Deserialize, Clone)]
struct NamedSubAccount {
    name: String,
    account_identifier: AccountIdentifier,
    transactions: Vec<TransactionIndex>,
}

#[derive(CandidType, Deserialize, Clone)]
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

#[derive(CandidType, Deserialize, Clone)]
struct Transaction {
    transaction_index: TransactionIndex,
    block_height: BlockHeight,
    timestamp: TimeStamp,
    memo: Memo,
    transfer: Transfer,
    transaction_type: Option<TransactionType>,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum TransactionToBeProcessed {
    StakeNeuron(PrincipalId, Memo),
    TopUpNeuron(PrincipalId, Memo),
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub struct CreateCanisterArgs {
    pub controller: PrincipalId,
    pub amount: ICPTs,
    pub refund_address: AccountIdentifier,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub struct TopUpCanisterArgs {
    pub principal: PrincipalId,
    pub canister_id: CanisterId,
    pub amount: ICPTs,
    pub refund_address: AccountIdentifier,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct RefundTransactionArgs {
    pub recipient_principal: PrincipalId,
    pub from_sub_account: Subaccount,
    pub amount: ICPTs,
    pub original_transaction_block_height: BlockHeight,
    pub refund_address: AccountIdentifier,
    pub error_message: String,
}

#[derive(Copy, Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
enum TransactionType {
    Burn,
    Mint,
    Send,
    StakeNeuron,
    StakeNeuronNotification,
    TopUpNeuron,
    CreateCanister,
    TopUpCanister(CanisterId),
}

#[derive(Clone, CandidType, Deserialize)]
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

#[derive(Deserialize)]
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

#[derive(Deserialize)]
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

#[derive(Deserialize)]
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

#[derive(Deserialize)]
pub struct DetachCanisterRequest {
    canister_id: CanisterId,
}

#[derive(CandidType)]
pub enum DetachCanisterResponse {
    Ok,
    CanisterNotFound,
    AccountNotFound,
}

impl AsHashTree for Account {
    fn root_hash(&self) -> Hash {
        let serialized_bytes = Encode!(self).unwrap();
        leaf_hash(&serialized_bytes)
    }

    fn as_hash_tree(&self) -> HashTree<'_> {
        let serialized_bytes = Encode!(self).unwrap();
        HashTree::Leaf(Cow::from(serialized_bytes))
    }
}

struct TransactionWrapper(Vec<Transaction>);

fn concat_tx_bytes(tx_vec: &[Transaction]) -> Vec<u8> {
    tx_vec
        .iter()
        .map(|tx| tx.root_hash())
        .fold(vec![], |mut acc, x| {
            acc.extend(x.to_vec());
            acc
        })
}

impl AsHashTree for TransactionWrapper {
    fn root_hash(&self) -> Hash {
        let serialized_bytes = Encode!(&concat_tx_bytes(&self.0)).unwrap();
        leaf_hash(&serialized_bytes)
    }

    fn as_hash_tree(&self) -> HashTree<'_> {
        let serialized_bytes = Encode!(&concat_tx_bytes(&self.0)).unwrap();
        HashTree::Leaf(Cow::from(serialized_bytes))
    }
}

impl AsHashTree for Transaction {
    fn root_hash(&self) -> Hash {
        let serialized_bytes = Encode!(self).unwrap();
        leaf_hash(&serialized_bytes)
    }

    fn as_hash_tree(&self) -> HashTree<'_> {
        let serialized_bytes = Encode!(self).unwrap();
        HashTree::Leaf(Cow::from(serialized_bytes))
    }
}

impl AccountsStore {
    pub fn get_account(&self, caller: PrincipalId) -> Option<AccountDetails> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.try_get_account_by_default_identifier(&account_identifier) {
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
        match self
            .account_identifier_lookup
            .entry(AccountIdentifier::from(caller))
        {
            Occupied(e) => {
                match e.get() {
                    AccountLocation::DefaultAccount(account_index) => {
                        let mut account = self
                            .accounts
                            .get_mut(*account_index as usize)
                            .unwrap()
                            .as_mut()
                            .unwrap();

                        if account.principal.is_none() {
                            account.principal = Some(caller);

                            let canister_ids: Vec<CanisterId> =
                                account.canisters.iter().map(|c| c.canister_id).collect();

                            // Now that we know the principal we can set the transaction types. The
                            // transactions must be sorted since some transaction types can only be
                            // determined based on earlier transactions (eg. we can only detect
                            // TopUpNeuron transactions that happen after StakeNeuron transactions).
                            for transaction_index in account
                                .get_all_transactions_linked_to_principal_sorted()
                                .iter()
                            {
                                let transaction = self.get_transaction(*transaction_index).unwrap();
                                if transaction.transaction_type.is_none() {
                                    let transaction_type = match transaction.transfer {
                                        Burn { from: _, amount: _ } => TransactionType::Burn,
                                        Mint { to: _, amount: _ } => TransactionType::Mint,
                                        Send {
                                            from,
                                            to,
                                            amount,
                                            fee: _,
                                        } => {
                                            if self.account_identifier_lookup.contains_key(&to) {
                                                // If the recipient is a known account then the transaction must be a basic Send,
                                                // since for all the 'special' transaction types the recipient is not a user account
                                                TransactionType::Send
                                            } else {
                                                let memo = transaction.memo;
                                                let transaction_type = self.get_transaction_type(
                                                    from,
                                                    to,
                                                    amount,
                                                    memo,
                                                    &caller,
                                                    &canister_ids,
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
                                    };
                                    self.get_transaction_mut(*transaction_index)
                                        .unwrap()
                                        .transaction_type = Some(transaction_type);
                                }
                            }
                        }
                        false
                    }
                    _ => true,
                }
            }
            Vacant(e) => {
                let new_account = Account::new(caller, *e.key());
                let account_index: u32;
                if self.empty_account_indices.is_empty() {
                    account_index = self.accounts.len() as u32;
                    self.accounts.push(Some(new_account));
                } else {
                    account_index = self
                        .empty_account_indices
                        .remove(self.empty_account_indices.len() - 1);
                    let account: &mut Option<Account> =
                        self.accounts.get_mut(account_index as usize).unwrap();
                    assert!(account.is_none());
                    *account = Some(new_account);
                }
                e.insert(AccountLocation::DefaultAccount(account_index));
                self.accounts_count += 1;
                true
            }
        }
    }

    pub fn create_sub_account(
        &mut self,
        caller: PrincipalId,
        sub_account_name: String,
    ) -> CreateSubAccountResponse {
        if !Self::validate_account_name(&sub_account_name) {
            CreateSubAccountResponse::NameTooLong
        } else if let Some(account_index) =
            self.try_get_account_index_by_default_identifier(&AccountIdentifier::from(caller))
        {
            let account: &mut Account = self
                .accounts
                .get_mut(account_index as usize)
                .unwrap()
                .as_mut()
                .unwrap();
            if account.sub_accounts.len() == (u8::MAX as usize) {
                CreateSubAccountResponse::SubAccountLimitExceeded
            } else {
                let sub_account_id = (1..u8::MAX)
                    .find(|i| !account.sub_accounts.contains_key(i))
                    .unwrap();

                let sub_account = convert_byte_to_sub_account(sub_account_id);
                let sub_account_identifier = AccountIdentifier::new(caller, Some(sub_account));
                let named_sub_account =
                    NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);

                account
                    .sub_accounts
                    .insert(sub_account_id, named_sub_account);
                self.account_identifier_lookup.insert(
                    sub_account_identifier,
                    AccountLocation::SubAccount(account_index, sub_account_id),
                );
                self.sub_accounts_count += 1;

                CreateSubAccountResponse::Ok(SubAccountDetails {
                    name: sub_account_name,
                    sub_account,
                    account_identifier: sub_account_identifier,
                })
            }
        } else {
            CreateSubAccountResponse::AccountNotFound
        }
    }

    pub fn rename_sub_account(
        &mut self,
        caller: PrincipalId,
        request: RenameSubAccountRequest,
    ) -> RenameSubAccountResponse {
        if !Self::validate_account_name(&request.new_name) {
            RenameSubAccountResponse::NameTooLong
        } else if let Some(account) =
            self.try_get_account_mut_by_default_identifier(&AccountIdentifier::from(caller))
        {
            if let Some(sub_account) = account
                .sub_accounts
                .values_mut()
                .find(|sub_account| sub_account.account_identifier == request.account_identifier)
            {
                sub_account.name = request.new_name;
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
        if !Self::validate_account_name(&request.name) {
            RegisterHardwareWalletResponse::NameTooLong
        } else if let Some(index) =
            self.try_get_account_index_by_default_identifier(&AccountIdentifier::from(caller))
        {
            let account = self
                .accounts
                .get_mut(index as usize)
                .unwrap()
                .as_mut()
                .unwrap();
            if account.hardware_wallet_accounts.len() == (u8::MAX as usize) {
                RegisterHardwareWalletResponse::HardwareWalletLimitExceeded
            } else if account
                .hardware_wallet_accounts
                .iter()
                .any(|hw| hw.principal == request.principal)
            {
                RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered
            } else {
                let account_identifier = AccountIdentifier::from(request.principal);
                account
                    .hardware_wallet_accounts
                    .push(NamedHardwareWalletAccount {
                        name: request.name,
                        principal: request.principal,
                        transactions: Vec::new(),
                    });
                account
                    .hardware_wallet_accounts
                    .sort_unstable_by_key(|hw| hw.name.clone());

                Self::link_hardware_wallet_to_account_index(
                    &mut self.account_identifier_lookup,
                    account_identifier,
                    index,
                );
                self.hardware_wallet_accounts_count += 1;

                RegisterHardwareWalletResponse::Ok
            }
        } else {
            RegisterHardwareWalletResponse::AccountNotFound
        }
    }

    pub fn append_transaction(
        &mut self,
        transfer: Transfer,
        memo: Memo,
        block_height: BlockHeight,
        timestamp: TimeStamp,
    ) -> Result<bool, String> {
        if let Some(block_height_synced_up_to) = self.get_block_height_synced_up_to() {
            let expected_block_height = block_height_synced_up_to + 1;
            if block_height != block_height_synced_up_to + 1 {
                return Err(format!(
                    "Expected block height {}. Got block height {}",
                    expected_block_height, block_height
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
            Send {
                from,
                to,
                amount,
                fee: _,
            } => {
                if self.try_add_transaction_to_account(to, transaction_index) {
                    self.try_add_transaction_to_account(from, transaction_index);
                    should_store_transaction = true;
                    transaction_type = Some(TransactionType::Send);
                } else if self.try_add_transaction_to_account(from, transaction_index) {
                    should_store_transaction = true;
                    if let Some(principal) = self.try_get_principal(&from) {
                        let canister_ids: Vec<CanisterId> = self
                            .get_canisters(principal)
                            .iter()
                            .map(|c| c.canister_id)
                            .collect();
                        transaction_type = Some(self.get_transaction_type(
                            from,
                            to,
                            amount,
                            memo,
                            &principal,
                            &canister_ids,
                        ));
                        self.process_transaction_type(
                            transaction_type.unwrap(),
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
                        neuron_details.principal,
                        block_height,
                        MultiPartTransactionToBeProcessed::TopUpNeuron(
                            neuron_details.principal,
                            neuron_details.memo,
                        ),
                    );
                }
            }
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
        self.last_ledger_sync_timestamp_nanos = dfn_core::api::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_nanos() as u64;
    }

    pub fn init_block_height_synced_up_to(&mut self, block_height: BlockHeight) {
        if self.block_height_synced_up_to.is_some() {
            panic!("This can only be called to initialize the 'block_height_synced_up_to' value");
        }

        self.block_height_synced_up_to = Some(block_height);
    }

    pub fn get_transactions(
        &self,
        caller: PrincipalId,
        request: GetTransactionsRequest,
    ) -> GetTransactionsResponse {
        let account_identifier = AccountIdentifier::from(caller);
        let account = self.try_get_account_by_default_identifier(&account_identifier);
        if account.is_none() {
            return GetTransactionsResponse {
                transactions: vec![],
                total: 0,
            };
        }
        let account = account.unwrap();
        let transactions: &Vec<TransactionIndex>;
        if account_identifier == request.account_identifier {
            transactions = &account.default_account_transactions;
        } else if let Some(hardware_wallet_account) = account
            .hardware_wallet_accounts
            .iter()
            .find(|a| request.account_identifier == AccountIdentifier::from(a.principal))
        {
            transactions = &hardware_wallet_account.transactions;
        } else if let Some(sub_account) = account
            .sub_accounts
            .values()
            .find(|a| a.account_identifier == request.account_identifier)
        {
            transactions = &sub_account.transactions;
        } else {
            return GetTransactionsResponse {
                transactions: vec![],
                total: 0,
            };
        }

        let results: Vec<TransactionResult> = transactions
            .iter()
            .rev()
            .skip(request.offset as usize)
            .take(request.page_size as usize)
            .cloned()
            .map(|transaction_index| {
                let transaction = self.get_transaction(transaction_index).unwrap();
                TransactionResult {
                    block_height: transaction.block_height,
                    timestamp: transaction.timestamp,
                    memo: transaction.memo,
                    transfer: match transaction.transfer {
                        Burn { amount, from: _ } => TransferResult::Burn { amount },
                        Mint { amount, to: _ } => TransferResult::Mint { amount },
                        Send {
                            from,
                            to,
                            amount,
                            fee,
                        } => {
                            if from == request.account_identifier {
                                TransferResult::Send { to, amount, fee }
                            } else {
                                TransferResult::Receive { from, amount, fee }
                            }
                        }
                    },
                    transaction_type: transaction.transaction_type,
                }
            })
            .collect();

        GetTransactionsResponse {
            transactions: results,
            total: transactions.len() as u32,
        }
    }

    pub fn attach_canister(
        &mut self,
        caller: PrincipalId,
        request: AttachCanisterRequest,
    ) -> AttachCanisterResponse {
        if !Self::validate_canister_name(&request.name) {
            AttachCanisterResponse::NameTooLong
        } else {
            let account_identifier = AccountIdentifier::from(caller);
            if let Some(account) =
                self.try_get_account_mut_by_default_identifier(&account_identifier)
            {
                if account.canisters.len() >= u8::MAX as usize {
                    return AttachCanisterResponse::CanisterLimitExceeded;
                }
                for c in account.canisters.iter() {
                    if !request.name.is_empty() && c.name == request.name {
                        return AttachCanisterResponse::NameAlreadyTaken;
                    } else if c.canister_id == request.canister_id {
                        return AttachCanisterResponse::CanisterAlreadyAttached;
                    }
                }
                account.canisters.push(NamedCanister {
                    name: request.name,
                    canister_id: request.canister_id,
                });
                sort_canisters(&mut account.canisters);

                AttachCanisterResponse::Ok
            } else {
                AttachCanisterResponse::AccountNotFound
            }
        }
    }

    pub fn detach_canister(
        &mut self,
        caller: PrincipalId,
        request: DetachCanisterRequest,
    ) -> DetachCanisterResponse {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.try_get_account_mut_by_default_identifier(&account_identifier) {
            if let Some(index) = account
                .canisters
                .iter()
                .enumerate()
                .find(|(_, canister)| canister.canister_id == request.canister_id)
                .map(|(index, _)| index)
            {
                account.canisters.remove(index);
                DetachCanisterResponse::Ok
            } else {
                DetachCanisterResponse::CanisterNotFound
            }
        } else {
            DetachCanisterResponse::AccountNotFound
        }
    }

    pub fn get_canisters(&self, caller: PrincipalId) -> Vec<NamedCanister> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.try_get_account_by_default_identifier(&account_identifier) {
            account.canisters.to_vec()
        } else {
            Vec::new()
        }
    }

    // We skip the checks here since in this scenario we must store the canister otherwise the user
    // won't be able to retrieve its Id.
    pub fn attach_newly_created_canister(
        &mut self,
        principal: PrincipalId,
        block_height: BlockHeight,
        canister_id: CanisterId,
    ) {
        let account_identifier = AccountIdentifier::from(principal);
        if let Some(account) = self.try_get_account_mut_by_default_identifier(&account_identifier) {
            account.canisters.push(NamedCanister {
                name: "".to_string(),
                canister_id,
            });
            sort_canisters(&mut account.canisters);
            self.multi_part_transactions_processor.update_status(
                block_height,
                MultiPartTransactionStatus::CanisterCreated(canister_id),
            );
        }
    }

    pub fn enqueue_transaction_to_be_refunded(&mut self, args: RefundTransactionArgs) {
        self.multi_part_transactions_processor.push(
            args.recipient_principal,
            args.original_transaction_block_height,
            MultiPartTransactionToBeProcessed::RefundTransaction(args),
        );
    }

    pub fn process_transaction_refund_completed(
        &mut self,
        original_transaction_block_height: BlockHeight,
        refund_block_height: BlockHeight,
        error_message: String,
    ) {
        self.multi_part_transactions_processor.update_status(
            original_transaction_block_height,
            MultiPartTransactionStatus::Refunded(refund_block_height, error_message),
        );
    }

    pub fn process_multi_part_transaction_error(
        &mut self,
        block_height: BlockHeight,
        error: String,
        refund_pending: bool,
    ) {
        let status = if refund_pending {
            MultiPartTransactionStatus::ErrorWithRefundPending(error)
        } else {
            MultiPartTransactionStatus::Error(error)
        };

        self.multi_part_transactions_processor
            .update_status(block_height, status);
    }

    pub fn get_next_transaction_index(&self) -> TransactionIndex {
        match self.transactions.back() {
            Some(t) => t.transaction_index + 1,
            None => 0,
        }
    }

    pub fn get_block_height_synced_up_to(&self) -> Option<BlockHeight> {
        self.block_height_synced_up_to
    }

    pub fn get_multi_part_transaction_status(
        &self,
        caller: PrincipalId,
        block_height: BlockHeight,
    ) -> MultiPartTransactionStatus {
        if self.get_block_height_synced_up_to().unwrap_or(0) < block_height {
            MultiPartTransactionStatus::PendingSync
        } else {
            self.multi_part_transactions_processor
                .get_status(caller, block_height)
        }
    }

    pub fn get_multi_part_transaction_errors(&self) -> Vec<MultiPartTransactionError> {
        self.multi_part_transactions_processor.get_errors()
    }

    pub fn try_take_next_transaction_to_process(
        &mut self,
    ) -> Option<(BlockHeight, MultiPartTransactionToBeProcessed)> {
        self.multi_part_transactions_processor.take_next()
    }

    pub fn mark_neuron_created(
        &mut self,
        principal: &PrincipalId,
        block_height: BlockHeight,
        memo: Memo,
        neuron_id: NeuronId,
    ) {
        let account_identifier = Self::generate_stake_neuron_address(principal, memo);
        self.neuron_accounts
            .get_mut(&account_identifier)
            .unwrap()
            .neuron_id = Some(neuron_id);
        self.multi_part_transactions_processor.update_status(
            block_height,
            MultiPartTransactionStatus::NeuronCreated(neuron_id),
        );
    }

    pub fn mark_neuron_topped_up(&mut self, block_height: BlockHeight) {
        self.neurons_topped_up_count += 1;
        self.multi_part_transactions_processor
            .update_status(block_height, MultiPartTransactionStatus::Complete);
    }

    pub fn mark_canister_topped_up(&mut self, original_transaction_block_height: BlockHeight) {
        self.multi_part_transactions_processor.update_status(
            original_transaction_block_height,
            MultiPartTransactionStatus::Complete,
        );
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn get_transactions_count(&self) -> u32 {
        self.transactions.len() as u32
    }

    pub fn prune_transactions(&mut self, count_to_prune: u32) -> u32 {
        let count_to_prune = min(count_to_prune, self.transactions.len() as u32);

        if count_to_prune > 0 {
            let transactions: Vec<_> = self
                .transactions
                .drain(RangeTo {
                    end: count_to_prune as usize,
                })
                .collect();

            let min_transaction_index = self.transactions.front().unwrap().transaction_index;

            for transaction in transactions {
                match transaction.transfer {
                    Burn { from, amount: _ } => {
                        self.prune_transactions_from_account(from, min_transaction_index)
                    }
                    Mint { to, amount: _ } => {
                        self.prune_transactions_from_account(to, min_transaction_index)
                    }
                    Send {
                        from,
                        to,
                        amount: _,
                        fee: _,
                    } => {
                        self.prune_transactions_from_account(from, min_transaction_index);
                        self.prune_transactions_from_account(to, min_transaction_index);
                    }
                }
            }
        }

        count_to_prune as u32
    }

    pub fn get_stats(&self) -> Stats {
        let earliest_transaction = self.transactions.front();
        let latest_transaction = self.transactions.back();
        let timestamp_now_nanos = dfn_core::api::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_nanos() as u64;
        let duration_since_last_sync =
            Duration::from_nanos(timestamp_now_nanos - self.last_ledger_sync_timestamp_nanos);

        Stats {
            accounts_count: self.accounts_count,
            sub_accounts_count: self.sub_accounts_count,
            hardware_wallet_accounts_count: self.hardware_wallet_accounts_count,
            transactions_count: self.transactions.len() as u64,
            block_height_synced_up_to: self.block_height_synced_up_to,
            earliest_transaction_timestamp_nanos: earliest_transaction
                .map_or(0, |t| t.timestamp.timestamp_nanos),
            earliest_transaction_block_height: earliest_transaction.map_or(0, |t| t.block_height),
            latest_transaction_timestamp_nanos: latest_transaction
                .map_or(0, |t| t.timestamp.timestamp_nanos),
            latest_transaction_block_height: latest_transaction.map_or(0, |t| t.block_height),
            seconds_since_last_ledger_sync: duration_since_last_sync.as_secs(),
            neurons_created_count: self.neuron_accounts.len() as u64,
            neurons_topped_up_count: self.neurons_topped_up_count,
            transactions_to_process_queue_length: self
                .multi_part_transactions_processor
                .get_queue_length(),
        }
    }

    fn try_add_transaction_to_account(
        &mut self,
        account_identifier: AccountIdentifier,
        transaction_index: TransactionIndex,
    ) -> bool {
        if let Some(location) = self.account_identifier_lookup.get(&account_identifier) {
            match location {
                AccountLocation::DefaultAccount(index) => {
                    let account = self
                        .accounts
                        .get_mut(*index as usize)
                        .unwrap()
                        .as_mut()
                        .unwrap();
                    account.append_default_account_transaction(transaction_index);
                }
                AccountLocation::SubAccount(index, sub_account) => {
                    let account = self
                        .accounts
                        .get_mut(*index as usize)
                        .unwrap()
                        .as_mut()
                        .unwrap();
                    account.append_sub_account_transaction(*sub_account, transaction_index);
                }
                AccountLocation::HardwareWallet(indexes) => {
                    for &index in indexes.iter() {
                        let account = self
                            .accounts
                            .get_mut(index as usize)
                            .unwrap()
                            .as_mut()
                            .unwrap();
                        account.append_hardware_wallet_transaction(
                            account_identifier,
                            transaction_index,
                        );
                    }
                }
            }

            true
        } else {
            false
        }
    }

    fn try_get_principal(&self, account_identifier: &AccountIdentifier) -> Option<PrincipalId> {
        if let Some(location) = self.account_identifier_lookup.get(account_identifier) {
            match location {
                AccountLocation::DefaultAccount(index) => {
                    let account = self
                        .accounts
                        .get(*index as usize)
                        .unwrap()
                        .as_ref()
                        .unwrap();
                    account.principal
                }
                AccountLocation::SubAccount(index, _) => {
                    let account = self
                        .accounts
                        .get(*index as usize)
                        .unwrap()
                        .as_ref()
                        .unwrap();
                    account.principal
                }
                AccountLocation::HardwareWallet(indexes) => indexes
                    .iter()
                    .filter_map(|i| {
                        if let Some(a) = self.accounts.get(*i as usize) {
                            a.as_ref()
                        } else {
                            None
                        }
                    })
                    .find_map(|a| {
                        a.hardware_wallet_accounts
                            .iter()
                            .find(|hw| *account_identifier == AccountIdentifier::from(hw.principal))
                    })
                    .map(|hw| hw.principal),
            }
        } else {
            None
        }
    }

    fn try_get_account_index_by_default_identifier(
        &self,
        account_identifier: &AccountIdentifier,
    ) -> Option<u32> {
        if let Some(AccountLocation::DefaultAccount(index)) =
            self.account_identifier_lookup.get(account_identifier)
        {
            return Some(*index);
        }
        None
    }

    fn try_get_account_by_default_identifier(
        &self,
        account_identifier: &AccountIdentifier,
    ) -> Option<&Account> {
        if let Some(index) = self.try_get_account_index_by_default_identifier(account_identifier) {
            return Some(self.accounts.get(index as usize).unwrap().as_ref().unwrap());
        }
        None
    }

    fn try_get_account_mut_by_default_identifier(
        &mut self,
        account_identifier: &AccountIdentifier,
    ) -> Option<&mut Account> {
        if let Some(index) = self.try_get_account_index_by_default_identifier(account_identifier) {
            return Some(
                self.accounts
                    .get_mut(index as usize)
                    .unwrap()
                    .as_mut()
                    .unwrap(),
            );
        }
        None
    }

    fn get_transaction(&self, transaction_index: TransactionIndex) -> Option<&Transaction> {
        match self.transactions.front() {
            Some(t) => {
                if t.transaction_index > transaction_index {
                    None
                } else {
                    let offset = t.transaction_index;
                    self.transactions.get((transaction_index - offset) as usize)
                }
            }
            None => None,
        }
    }

    fn get_transaction_mut(
        &mut self,
        transaction_index: TransactionIndex,
    ) -> Option<&mut Transaction> {
        match self.transactions.front() {
            Some(t) => {
                if t.transaction_index > transaction_index {
                    None
                } else {
                    let offset = t.transaction_index;
                    self.transactions
                        .get_mut((transaction_index - offset) as usize)
                }
            }
            None => None,
        }
    }

    fn link_hardware_wallet_to_account_index(
        account_identifier_lookup: &mut HashMap<AccountIdentifier, AccountLocation>,
        hardware_wallet_account_identifier: AccountIdentifier,
        account_index: u32,
    ) {
        match account_identifier_lookup.entry(hardware_wallet_account_identifier) {
            Occupied(mut e) => {
                if let AccountLocation::HardwareWallet(indexes) = e.get_mut() {
                    indexes.push(account_index);
                }
            }
            Vacant(e) => {
                e.insert(AccountLocation::HardwareWallet(vec![account_index]));
            }
        };
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

        if let Some(location) = self.account_identifier_lookup.get(&account_identifier) {
            match location {
                AccountLocation::DefaultAccount(index) => {
                    if let Some(account) = self.accounts.get_mut(*index as usize).unwrap().as_mut()
                    {
                        let transactions = &mut account.default_account_transactions;
                        prune_transactions_impl(transactions, prune_blocks_previous_to);
                    }
                }
                AccountLocation::SubAccount(index, sub_account) => {
                    if let Some(account) = self.accounts.get_mut(*index as usize).unwrap().as_mut()
                    {
                        if let Some(sub_account) = &mut account.sub_accounts.get_mut(sub_account) {
                            let transactions = &mut sub_account.transactions;
                            prune_transactions_impl(transactions, prune_blocks_previous_to);
                        }
                    }
                }
                AccountLocation::HardwareWallet(indexes) => {
                    for index in indexes.iter() {
                        if let Some(account) =
                            self.accounts.get_mut(*index as usize).unwrap().as_mut()
                        {
                            if let Some(hardware_wallet_account) =
                                account.hardware_wallet_accounts.iter_mut().find(|a| {
                                    account_identifier == AccountIdentifier::from(a.principal)
                                })
                            {
                                let transactions = &mut hardware_wallet_account.transactions;
                                prune_transactions_impl(transactions, prune_blocks_previous_to);
                            }
                        }
                    }
                }
            }
        }
    }

    fn get_transaction_index(&self, block_height: BlockHeight) -> Option<TransactionIndex> {
        // The binary search methods are taken from here (they will be in stable rust shortly) -
        // https://github.com/vojtechkral/rust/blob/c7a787a3276cadad7ee51577f65158b4888c058c/library/alloc/src/collections/vec_deque.rs#L2515
        fn binary_search_by_key<T, B, F>(
            vec_deque: &VecDeque<T>,
            b: &B,
            mut f: F,
        ) -> Result<usize, usize>
        where
            F: FnMut(&T) -> B,
            B: Ord,
        {
            binary_search_by(vec_deque, |k| f(k).cmp(b))
        }

        fn binary_search_by<T, F>(vec_deque: &VecDeque<T>, mut f: F) -> Result<usize, usize>
        where
            F: FnMut(&T) -> Ordering,
        {
            let (front, back) = vec_deque.as_slices();

            let search_back = matches!(
                back.first().map(|elem| f(elem)),
                Some(Ordering::Less) | Some(Ordering::Equal)
            );
            if search_back {
                back.binary_search_by(f)
                    .map(|idx| idx + front.len())
                    .map_err(|idx| idx + front.len())
            } else {
                front.binary_search_by(f)
            }
        }

        if let Some(latest_transaction) = self.transactions.back() {
            let max_block_height = latest_transaction.block_height;
            if block_height <= max_block_height {
                // binary_search_by_key is not yet in stable rust (https://github.com/rust-lang/rust/issues/78021)
                // TODO uncomment the line below once binary_search_by_key is in stable rust
                // self.transactions.binary_search_by_key(&block_height, |t| t.block_height).ok().map(|i| i as u64)
                return binary_search_by_key(&self.transactions, &block_height, |t| t.block_height)
                    .ok()
                    .map(|i| i as u64);
            }
        }
        None
    }

    fn get_transaction_type(
        &self,
        from: AccountIdentifier,
        to: AccountIdentifier,
        amount: ICPTs,
        memo: Memo,
        principal: &PrincipalId,
        canister_ids: &[CanisterId],
    ) -> TransactionType {
        if from == to {
            TransactionType::Send
        } else if self.neuron_accounts.contains_key(&to) {
            if self.is_stake_neuron_notification(memo, &from, &to, amount) {
                TransactionType::StakeNeuronNotification
            } else {
                TransactionType::TopUpNeuron
            }
        } else if memo.0 > 0 {
            if Self::is_create_canister_transaction(memo, &to, principal) {
                TransactionType::CreateCanister
            } else if let Some(canister_id) =
                Self::is_topup_canister_transaction(memo, &to, canister_ids)
            {
                TransactionType::TopUpCanister(canister_id)
            } else if Self::is_stake_neuron_transaction(memo, &to, principal) {
                TransactionType::StakeNeuron
            } else {
                TransactionType::Send
            }
        } else {
            TransactionType::Send
        }
    }

    fn is_create_canister_transaction(
        memo: Memo,
        to: &AccountIdentifier,
        principal: &PrincipalId,
    ) -> bool {
        if memo == MEMO_CREATE_CANISTER {
            let expected_to =
                AccountIdentifier::new(dfn_core::api::id().get(), Some(principal.into()));
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
        if memo == MEMO_TOP_UP_CANISTER {
            for canister_id in canister_ids.iter() {
                let expected_to = AccountIdentifier::new(
                    dfn_core::api::id().get(),
                    Some((&canister_id.get()).into()),
                );
                if *to == expected_to {
                    return Some(*canister_id);
                }
            }
        }
        None
    }

    fn is_stake_neuron_transaction(
        memo: Memo,
        to: &AccountIdentifier,
        principal: &PrincipalId,
    ) -> bool {
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
        amount: ICPTs,
    ) -> bool {
        if memo.0 > 0 && amount.get_e8s() == 0 {
            self.get_transaction_index(memo.0)
                .map(|index| self.get_transaction(index))
                .flatten()
                .filter(|&t| {
                    t.transaction_type.is_some()
                        && matches!(t.transaction_type.unwrap(), TransactionType::StakeNeuron)
                })
                .map_or(false, |t| {
                    if let Send {
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
    /// multi_part_transactions_processor which will work through the required actions in the
    /// background.
    #[allow(clippy::too_many_arguments)]
    fn process_transaction_type(
        &mut self,
        transaction_type: TransactionType,
        principal: PrincipalId,
        from: AccountIdentifier,
        to: AccountIdentifier,
        memo: Memo,
        amount: ICPTs,
        block_height: BlockHeight,
    ) {
        match transaction_type {
            TransactionType::StakeNeuron => {
                let neuron_details = NeuronDetails {
                    account_identifier: to,
                    principal,
                    memo,
                    neuron_id: None,
                };
                self.neuron_accounts.insert(to, neuron_details);
                self.multi_part_transactions_processor.push(
                    principal,
                    block_height,
                    MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo),
                );
            }
            TransactionType::TopUpNeuron => {
                if let Some(neuron_account) = self.neuron_accounts.get(&to) {
                    // We need to use the memo from the original stake neuron transaction
                    self.multi_part_transactions_processor.push(
                        principal,
                        block_height,
                        MultiPartTransactionToBeProcessed::TopUpNeuron(
                            neuron_account.principal,
                            neuron_account.memo,
                        ),
                    );
                }
            }
            TransactionType::CreateCanister => {
                let args = CreateCanisterArgs {
                    controller: principal,
                    amount,
                    refund_address: from,
                };
                self.multi_part_transactions_processor.push(
                    principal,
                    block_height,
                    MultiPartTransactionToBeProcessed::CreateCanister(args),
                );
            }
            TransactionType::TopUpCanister(canister_id) => {
                let args = TopUpCanisterArgs {
                    principal,
                    canister_id,
                    amount,
                    refund_address: from,
                };
                self.multi_part_transactions_processor.push(
                    principal,
                    block_height,
                    MultiPartTransactionToBeProcessed::TopUpCanister(args),
                );
            }
            _ => {}
        };
    }
}

impl StableState for AccountsStore {
    fn encode(&self) -> Vec<u8> {
        Candid((
            &self.transactions,
            &self.accounts,
            &self.neuron_accounts,
            &self.block_height_synced_up_to,
            &self.multi_part_transactions_processor,
            &self.last_ledger_sync_timestamp_nanos,
            &self.neurons_topped_up_count,
        ))
        .into_bytes()
        .unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        #[allow(clippy::type_complexity)]
        let (
            transactions,
            accounts,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
            last_ledger_sync_timestamp_nanos,
            neurons_topped_up_count,
        ): (
            VecDeque<Transaction>,
            Vec<Option<Account>>,
            HashMap<AccountIdentifier, NeuronDetails>,
            Option<BlockHeight>,
            MultiPartTransactionsProcessor,
            u64,
            u64,
        ) = Candid::from_bytes(bytes).map(|c| c.0)?;

        let mut account_identifier_lookup: HashMap<AccountIdentifier, AccountLocation> =
            HashMap::new();
        let mut empty_account_indices: Vec<u32> = Vec::new();
        let mut accounts_count: u64 = 0;
        let mut sub_accounts_count: u64 = 0;
        let mut hardware_wallet_accounts_count: u64 = 0;

        for i in 0..accounts.len() {
            if let Some(a) = accounts.get(i).unwrap() {
                let index = i as u32;
                account_identifier_lookup
                    .insert(a.account_identifier, AccountLocation::DefaultAccount(index));
                for (id, sa) in a.sub_accounts.iter() {
                    account_identifier_lookup.insert(
                        sa.account_identifier,
                        AccountLocation::SubAccount(index, *id),
                    );
                }
                for hw in a.hardware_wallet_accounts.iter() {
                    Self::link_hardware_wallet_to_account_index(
                        &mut account_identifier_lookup,
                        AccountIdentifier::from(hw.principal),
                        index,
                    );
                }
                accounts_count += 1;
                sub_accounts_count += a.sub_accounts.len() as u64;
                hardware_wallet_accounts_count += a.hardware_wallet_accounts.len() as u64;
            } else {
                empty_account_indices.push(i as u32);
            }
        }

        let transactions = VecDeque::from_iter(transactions);

        let mut accounts_certifiable = RbTree::new();
        let mut transactions_certifiable = RbTree::new();
        let hardware_wallets_and_sub_accounts = HashMap::new();

        fn get_transaction(
            transactions: &VecDeque<Transaction>,
            transaction_index: TransactionIndex,
        ) -> Option<&Transaction> {
            match transactions.front() {
                Some(t) => {
                    if t.transaction_index > transaction_index {
                        None
                    } else {
                        let offset = t.transaction_index;
                        transactions.get((transaction_index - offset) as usize)
                    }
                }
                None => None,
            }
        }

        // Delete this for subsequent upgrades
        for i in 0..accounts.len() {
            if let Some(a) = accounts.get(i).unwrap() {
                transactions_certifiable.insert(
                    a.account_identifier.to_vec(),
                    TransactionWrapper(
                        a.default_account_transactions
                            .iter()
                            .map(|ti| get_transaction(&transactions, *ti).unwrap().clone())
                            .collect(),
                    ),
                );

                a.sub_accounts.iter().for_each(|(_, sub_account)| {
                    transactions_certifiable.insert(
                        sub_account.account_identifier.to_vec(),
                        TransactionWrapper(
                            sub_account
                                .transactions
                                .iter()
                                .map(|ti| get_transaction(&transactions, *ti).unwrap().clone())
                                .collect(),
                        ),
                    );
                });

                a.hardware_wallet_accounts
                    .iter()
                    .for_each(|hardware_wallet_account| {
                        transactions_certifiable.insert(
                            AccountIdentifier::from(hardware_wallet_account.principal).to_vec(),
                            TransactionWrapper(
                                hardware_wallet_account
                                    .transactions
                                    .iter()
                                    .map(|ti| get_transaction(&transactions, *ti).unwrap().clone())
                                    .collect(),
                            ),
                        );
                    });

                accounts_certifiable.insert(a.account_identifier.to_vec(), a.clone());
            }
        }

        Ok(AccountsStore {
            accounts_certifiable,
            transactions_certifiable,
            hardware_wallets_and_sub_accounts,

            account_identifier_lookup,
            transactions,
            accounts,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
            empty_account_indices,
            accounts_count,
            sub_accounts_count,
            hardware_wallet_accounts_count,
            last_ledger_sync_timestamp_nanos,
            neurons_topped_up_count,
        })
    }
}

impl Account {
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

    pub fn append_sub_account_transaction(
        &mut self,
        sub_account: u8,
        transaction_index: TransactionIndex,
    ) {
        self.sub_accounts
            .get_mut(&sub_account)
            .unwrap()
            .transactions
            .push(transaction_index);
    }

    pub fn append_hardware_wallet_transaction(
        &mut self,
        account_identifier: AccountIdentifier,
        transaction_index: TransactionIndex,
    ) {
        let account = self
            .hardware_wallet_accounts
            .iter_mut()
            .find(|a| account_identifier == AccountIdentifier::from(a.principal))
            .unwrap();

        account.transactions.push(transaction_index);
    }

    pub fn get_all_transactions_linked_to_principal_sorted(&self) -> Vec<TransactionIndex> {
        self.default_account_transactions
            .iter()
            .cloned()
            .chain(
                self.sub_accounts
                    .values()
                    .map(|a| a.transactions.iter().cloned())
                    .flatten(),
            )
            .sorted()
            .collect()
    }
}

impl Transaction {
    pub fn new(
        transaction_index: TransactionIndex,
        block_height: BlockHeight,
        timestamp: TimeStamp,
        memo: Memo,
        transfer: Transfer,
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

/// This will sort the canisters such that those with names specified will appear first and will be
/// sorted by their names. Then those without names will appear last, sorted by their canister Ids.
fn sort_canisters(canisters: &mut Vec<NamedCanister>) {
    canisters.sort_unstable_by_key(|c| {
        if c.name.is_empty() {
            (true, c.canister_id.to_string())
        } else {
            (false, c.name.clone())
        }
    });
}

#[derive(Deserialize)]
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
    block_height: BlockHeight,
    timestamp: TimeStamp,
    memo: Memo,
    transfer: TransferResult,
    transaction_type: Option<TransactionType>,
}

#[derive(CandidType)]
pub enum TransferResult {
    Burn {
        amount: ICPTs,
    },
    Mint {
        amount: ICPTs,
    },
    Send {
        to: AccountIdentifier,
        amount: ICPTs,
        fee: ICPTs,
    },
    Receive {
        from: AccountIdentifier,
        amount: ICPTs,
        fee: ICPTs,
    },
}

#[derive(CandidType)]
pub struct Stats {
    accounts_count: u64,
    sub_accounts_count: u64,
    hardware_wallet_accounts_count: u64,
    transactions_count: u64,
    block_height_synced_up_to: Option<u64>,
    earliest_transaction_timestamp_nanos: u64,
    earliest_transaction_block_height: BlockHeight,
    latest_transaction_timestamp_nanos: u64,
    latest_transaction_block_height: BlockHeight,
    seconds_since_last_ledger_sync: u64,
    neurons_created_count: u64,
    neurons_topped_up_count: u64,
    transactions_to_process_queue_length: u32,
}

#[cfg(test)]
mod tests;
