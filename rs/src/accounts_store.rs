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
use std::collections::{HashMap, VecDeque};
use std::iter::FromIterator;
use std::ops::RangeTo;
use std::time::{Duration, SystemTime};

type TransactionIndex = u64;

#[derive(Default)]
pub struct AccountsStore {
    // TODO: Use AccountIdentifier directly as the key for this RbTree
    accounts: RbTree<Vec<u8>, Account>,
    hardware_wallets_and_sub_accounts: HashMap<AccountIdentifier, AccountWrapper>,

    transactions: VecDeque<Transaction>,
    neuron_accounts: HashMap<AccountIdentifier, NeuronDetails>,
    block_height_synced_up_to: Option<BlockHeight>,
    multi_part_transactions_processor: MultiPartTransactionsProcessor,

    accounts_count: u64,
    sub_accounts_count: u64,
    hardware_wallet_accounts_count: u64,
    last_ledger_sync_timestamp_nanos: u64,
    neurons_topped_up_count: u64,
}

#[derive(CandidType)]
enum AccountWrapper {
    SubAccount(AccountIdentifier, u8), // Account Identifier + Sub Account Identifier
    HardwareWallet(Vec<AccountIdentifier>), // Vec of Account Identifiers since a hardware wallet could theoretically be shared between multiple accounts
}

#[derive(CandidType, Deserialize)]
struct Account {
    principal: Option<PrincipalId>,
    account_identifier: AccountIdentifier,
    default_account_transactions: Vec<TransactionIndex>,
    sub_accounts: HashMap<u8, NamedSubAccount>,
    hardware_wallet_accounts: Vec<NamedHardwareWalletAccount>,
    canisters: Vec<NamedCanister>,
}

#[derive(CandidType, Deserialize)]
struct NamedSubAccount {
    name: String,
    account_identifier: AccountIdentifier,
    transactions: Vec<TransactionIndex>,
}

#[derive(CandidType, Deserialize)]
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

#[derive(CandidType, Deserialize)]
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

impl AccountsStore {
    pub fn get_account(&self, caller: PrincipalId) -> Option<AccountDetails> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts.get(&account_identifier.to_vec()) {
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
        let account_identifier = AccountIdentifier::from(caller);
        let retval = if self.accounts.get(&account_identifier.to_vec()).is_some() {
            let mut canister_ids = vec![];
            let mut transactions: Vec<TransactionIndex> = vec![];
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    if account.principal.is_none() {
                        account.principal = Some(caller);
                        canister_ids = account.canisters.iter().map(|c| c.canister_id).collect();
                        transactions = account.get_all_transactions_linked_to_principal_sorted();
                    }
                });
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
                        Send {
                            from,
                            to,
                            amount,
                            fee: _,
                        } => {
                            if self.accounts.get(&to.to_vec()).is_some() {
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
                    self.get_transaction_mut(transaction_index)
                        .unwrap()
                        .transaction_type = Some(transaction_type);
                }
            }
            false
        } else {
            let new_account = Account::new(caller, account_identifier);
            self.accounts
                .insert(account_identifier.to_vec(), new_account);
            self.accounts_count += 1;

            true
        };

        retval
    }

    pub fn create_sub_account(
        &mut self,
        caller: PrincipalId,
        sub_account_name: String,
    ) -> CreateSubAccountResponse {
        let account_identifier = AccountIdentifier::from(caller);

        if !Self::validate_account_name(&sub_account_name) {
            CreateSubAccountResponse::NameTooLong
        } else if self.accounts.get(&account_identifier.to_vec()).is_some() {
            let mut response = CreateSubAccountResponse::SubAccountLimitExceeded;
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    if account.sub_accounts.len() < (u8::MAX as usize) {
                        let sub_account_id = (1..u8::MAX)
                            .find(|i| !account.sub_accounts.contains_key(i))
                            .unwrap();

                        let sub_account = convert_byte_to_sub_account(sub_account_id);
                        let sub_account_identifier =
                            AccountIdentifier::new(caller, Some(sub_account));
                        let named_sub_account =
                            NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);

                        account
                            .sub_accounts
                            .insert(sub_account_id, named_sub_account);

                        response = CreateSubAccountResponse::Ok(SubAccountDetails {
                            name: sub_account_name,
                            sub_account,
                            account_identifier: sub_account_identifier,
                        });
                    }
                });

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
                self.sub_accounts_count += 1;
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
        } else if self.accounts.get(&account_identifier.to_vec()).is_some() {
            let mut response = RenameSubAccountResponse::Ok;
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    if let Some(sub_account) =
                        account.sub_accounts.values_mut().find(|sub_account| {
                            sub_account.account_identifier == request.account_identifier
                        })
                    {
                        sub_account.name = request.new_name;
                    } else {
                        response = RenameSubAccountResponse::SubAccountNotFound;
                    }
                });
            response
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
        } else if self.accounts.get(&account_identifier.to_vec()).is_some() {
            let hardware_wallet_account_identifier = AccountIdentifier::from(request.principal);
            let mut response = RegisterHardwareWalletResponse::Ok;

            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    if account.hardware_wallet_accounts.len() == (u8::MAX as usize) {
                        response = RegisterHardwareWalletResponse::HardwareWalletLimitExceeded;
                    } else if account
                        .hardware_wallet_accounts
                        .iter()
                        .any(|hw| hw.principal == request.principal)
                    {
                        response = RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered;
                    } else {
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
                    }
                });
            self.hardware_wallet_accounts_count += 1;
            self.link_hardware_wallet_to_account(
                account_identifier,
                hardware_wallet_account_identifier,
            );

            response
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
        let empty_transaction_response = GetTransactionsResponse {
            transactions: vec![],
            total: 0,
        };

        let transactions = match self.accounts.get(&account_identifier.to_vec()) {
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
            let account_identifier = AccountIdentifier::from(caller).to_vec();

            if self.accounts.get(&account_identifier.to_vec()).is_some() {
                let mut response = AttachCanisterResponse::Ok;
                self.accounts
                    .modify(&account_identifier.to_vec(), |account| {
                        if account.canisters.len() >= u8::MAX as usize {
                            response = AttachCanisterResponse::CanisterLimitExceeded;
                            return;
                        }
                        for c in account.canisters.iter() {
                            if !request.name.is_empty() && c.name == request.name {
                                response = AttachCanisterResponse::NameAlreadyTaken;
                                return;
                            } else if c.canister_id == request.canister_id {
                                response = AttachCanisterResponse::CanisterAlreadyAttached;
                                return;
                            }
                        }
                        account.canisters.push(NamedCanister {
                            name: request.name,
                            canister_id: request.canister_id,
                        });
                        sort_canisters(&mut account.canisters);
                    });
                response
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
        let account_identifier = AccountIdentifier::from(caller).to_vec();

        if self.accounts.get(&account_identifier.to_vec()).is_some() {
            let mut response = DetachCanisterResponse::Ok;
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    if let Some(index) = account
                        .canisters
                        .iter()
                        .enumerate()
                        .find(|(_, canister)| canister.canister_id == request.canister_id)
                        .map(|(index, _)| index)
                    {
                        account.canisters.remove(index);
                    } else {
                        response = DetachCanisterResponse::CanisterNotFound
                    }
                });
            response
        } else {
            DetachCanisterResponse::AccountNotFound
        }
    }

    pub fn get_canisters(&self, caller: PrincipalId) -> Vec<NamedCanister> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.accounts.get(&account_identifier.to_vec()) {
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
        let account_identifier = AccountIdentifier::from(principal).to_vec();

        if self.accounts.get(&account_identifier.to_vec()).is_some() {
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    account.canisters.push(NamedCanister {
                        name: "".to_string(),
                        canister_id,
                    });
                    sort_canisters(&mut account.canisters);
                });
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
        if self.accounts.get(&account_identifier.to_vec()).is_some() {
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    account.append_default_account_transaction(transaction_index);
                });
        } else {
            match self
                .hardware_wallets_and_sub_accounts
                .get(&account_identifier)
            {
                Some(AccountWrapper::SubAccount(parent_account_identifier, sub_account_index)) => {
                    self.accounts
                        .modify(&parent_account_identifier.to_vec(), |account| {
                            account.append_sub_account_transaction(
                                *sub_account_index,
                                transaction_index,
                            );
                        });
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => {
                    for linked_account_identifier in linked_account_identifiers {
                        self.accounts
                            .modify(&linked_account_identifier.to_vec(), |account| {
                                account.append_hardware_wallet_transaction(
                                    account_identifier,
                                    transaction_index,
                                );
                            });
                    }
                }
                None => return false,
            }
        }

        true
    }

    fn try_get_principal(&self, account_identifier: &AccountIdentifier) -> Option<PrincipalId> {
        if let Some(account) = self.accounts.get(&account_identifier.to_vec()) {
            account.principal
        } else {
            match self
                .hardware_wallets_and_sub_accounts
                .get(account_identifier)
            {
                Some(AccountWrapper::SubAccount(account_identifier, _)) => {
                    let account = self
                        .accounts
                        .get(&account_identifier.to_vec())
                        .unwrap_or_else(|| panic!("BROKEN STATE: Account identifier {} exists in `hardware_wallets_and_sub_accounts`, but not in `accounts`.", account_identifier));
                    account.principal
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => {
                    linked_account_identifiers
                        .iter()
                        .filter_map(|account_identifier| {
                            self.accounts.get(&account_identifier.to_vec())
                        })
                        .find_map(|a| {
                            a.hardware_wallet_accounts.iter().find(|hw| {
                                *account_identifier == AccountIdentifier::from(hw.principal)
                            })
                        })
                        .map(|hw| hw.principal)
                }
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

        if self.accounts.get(&account_identifier.to_vec()).is_some() {
            self.accounts
                .modify(&account_identifier.to_vec(), |account| {
                    let transactions = &mut account.default_account_transactions;
                    prune_transactions_impl(transactions, prune_blocks_previous_to);
                });
        } else {
            match self
                .hardware_wallets_and_sub_accounts
                .get(&account_identifier)
            {
                Some(AccountWrapper::SubAccount(parent_account_identifier, sub_account_index)) => {
                    self.accounts
                        .modify(&parent_account_identifier.to_vec(), |account| {
                            if let Some(sub_account) =
                                account.sub_accounts.get_mut(sub_account_index)
                            {
                                let transactions = &mut sub_account.transactions;
                                prune_transactions_impl(transactions, prune_blocks_previous_to);
                            }
                        });
                }
                Some(AccountWrapper::HardwareWallet(linked_account_identifiers)) => {
                    for linked_account_identifier in linked_account_identifiers {
                        self.accounts
                            .modify(&linked_account_identifier.to_vec(), |account| {
                                if let Some(hardware_wallet_account) =
                                    account.hardware_wallet_accounts.iter_mut().find(|a| {
                                        account_identifier == AccountIdentifier::from(a.principal)
                                    })
                                {
                                    let transactions = &mut hardware_wallet_account.transactions;
                                    prune_transactions_impl(transactions, prune_blocks_previous_to);
                                }
                            });
                    }
                }
                None => {}
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
        let mut accounts = vec![];
        self.accounts.for_each(|k, v| {
            accounts.push((k.to_vec(), Encode!(v).unwrap()));
        });

        Candid((
            accounts,
            &self.transactions,
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
            accounts_old,
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

        let mut accounts_count: u64 = 0;
        let mut sub_accounts_count: u64 = 0;
        let mut hardware_wallet_accounts_count: u64 = 0;

        let transactions = VecDeque::from_iter(transactions);

        let mut accounts = RbTree::new();
        let mut hardware_wallets_and_sub_accounts = HashMap::new();

        for a in accounts_old.into_iter().flatten() {
            a.sub_accounts
                .iter()
                .for_each(|(sub_account_identifier, sub_account)| {
                    hardware_wallets_and_sub_accounts.insert(
                        sub_account.account_identifier,
                        AccountWrapper::SubAccount(a.account_identifier, *sub_account_identifier),
                    );
                });
            sub_accounts_count += a.sub_accounts.len() as u64;

            a.hardware_wallet_accounts
                .iter()
                .for_each(|hardware_wallet_account| {
                    hardware_wallets_and_sub_accounts
                        .entry(AccountIdentifier::from(hardware_wallet_account.principal))
                        .and_modify(|account_wrapper| {
                            if let AccountWrapper::HardwareWallet(account_identifiers) =
                                account_wrapper
                            {
                                account_identifiers.push(a.account_identifier);
                            }
                        })
                        .or_insert_with(|| {
                            AccountWrapper::HardwareWallet(vec![a.account_identifier])
                        });
                });
            hardware_wallet_accounts_count += a.hardware_wallet_accounts.len() as u64;

            accounts.insert(a.account_identifier.to_vec(), a);
            accounts_count += 1;
        }

        Ok(AccountsStore {
            accounts,
            hardware_wallets_and_sub_accounts,

            transactions,
            neuron_accounts,
            block_height_synced_up_to,
            multi_part_transactions_processor,
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
