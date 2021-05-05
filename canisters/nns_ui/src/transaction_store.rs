use candid::CandidType;
use crate::state::StableState;
use dfn_candid::Candid;
use ic_base_types::PrincipalId;
use itertools::Itertools;
use ledger_canister::{
    AccountIdentifier,
    BlockHeight,
    Subaccount,
    TimeStamp,
    Transfer::{Burn, Mint, Send, self},
    ICPTs
};
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::cmp::min;
use std::collections::{hash_map::Entry::{Occupied, Vacant}, HashMap, VecDeque};
use std::iter::FromIterator;
use std::ops::RangeTo;
use std::time::{SystemTime, Duration};

type TransactionIndex = u64;

#[derive(Default)]
pub struct TransactionStore {
    account_identifier_lookup: HashMap<AccountIdentifier, AccountLocation>,
    transactions: VecDeque<Transaction>,
    accounts: Vec<Option<Account>>,
    block_height_synced_up_to: Option<BlockHeight>,

    // Use these up first before appending to the accounts Vec
    empty_account_indices: Vec<u32>,

    accounts_count: u64,
    sub_accounts_count: u64,
    hardware_wallet_accounts_count: u64,
    last_ledger_sync_timestamp_nanos: u64
}

#[derive(CandidType, Deserialize, Debug)]
enum AccountLocation {
    DefaultAccount(u32), // Account index
    SubAccount(u32, u8), // Account index + SubAccount index
    HardwareWallet(Vec<u32>) // Vec of account index since a hardware wallet could theoretically be shared between multiple accounts
}

#[derive(CandidType, Deserialize)]
struct Account {
    account_identifier: AccountIdentifier,
    default_account_transactions: Vec<TransactionIndex>,
    sub_accounts: HashMap<u8, NamedSubAccount>,
    hardware_wallet_accounts: Vec<NamedHardwareWalletAccount>
}

#[derive(CandidType, Deserialize)]
struct NamedSubAccount {
    name: String,
    account_identifier: AccountIdentifier,
    transactions: Vec<TransactionIndex>
}

#[derive(CandidType, Deserialize)]
struct NamedHardwareWalletAccount {
    name: String,
    account_identifier: AccountIdentifier,
    transactions: Vec<TransactionIndex>
}

#[derive(CandidType, Deserialize)]
struct Transaction {
    transaction_index: TransactionIndex,
    block_height: BlockHeight,
    timestamp: TimeStamp,
    transfer: Transfer,
}

#[derive(CandidType)]
pub enum CreateSubAccountResponse {
    Ok(SubAccountDetails),
    AccountNotFound,
    SubAccountLimitExceeded,
    NameTooLong
}

#[derive(Deserialize)]
pub struct RenameSubAccountRequest {
    account_identifier: AccountIdentifier,
    new_name: String
}

#[derive(CandidType)]
pub enum RenameSubAccountResponse {
    Ok,
    AccountNotFound,
    SubAccountNotFound
}

#[derive(Deserialize)]
pub struct RegisterHardwareWalletRequest {
    name: String,
    account_identifier: AccountIdentifier
}

#[derive(CandidType)]
pub enum RegisterHardwareWalletResponse {
    Ok,
    AccountNotFound,
    HardwareWalletAlreadyRegistered,
    HardwareWalletLimitExceeded,
    NameTooLong
}

#[derive(Deserialize)]
pub struct RemoveHardwareWalletRequest {
    account_identifier: AccountIdentifier
}

#[derive(CandidType)]
pub enum RemoveHardwareWalletResponse {
    Ok,
    AccountNotFound,
    HardwareWalletNotFound
}

#[derive(CandidType)]
pub struct AccountDetails {
    account_identifier: AccountIdentifier,
    sub_accounts: Vec<SubAccountDetails>,
    hardware_wallet_accounts: Vec<HardwareWalletAccountDetails>
}

#[derive(CandidType)]
pub struct SubAccountDetails {
    name: String,
    sub_account: Subaccount,
    account_identifier: AccountIdentifier
}

#[derive(CandidType)]
pub struct HardwareWalletAccountDetails {
    name: String,
    account_identifier: AccountIdentifier
}

impl TransactionStore {
    pub fn get_account(&self, caller: PrincipalId) -> Option<AccountDetails> {
        let account_identifier = AccountIdentifier::from(caller);
        if let Some(account) = self.try_get_account_by_default_identifier(&account_identifier) {
            let sub_accounts = account.sub_accounts
                .iter()
                .sorted_unstable_by_key(|(_, sub_account)| sub_account.name.clone())
                .map(|(id, sa)| SubAccountDetails {
                    name: sa.name.clone(),
                    sub_account: convert_byte_to_sub_account(*id),
                    account_identifier: sa.account_identifier
                })
                .collect();

            let hardware_wallet_accounts = account.hardware_wallet_accounts
                .iter()
                .map(|a| HardwareWalletAccountDetails {
                    name: a.name.clone(),
                    account_identifier: a.account_identifier.clone()
                })
                .collect();

            Some(AccountDetails {
                account_identifier,
                sub_accounts,
                hardware_wallet_accounts
            })
        } else {
            None
        }
    }

    pub fn add_account(&mut self, caller: PrincipalId) -> bool {
        match self.account_identifier_lookup.entry(AccountIdentifier::from(caller)) {
            Occupied(_) => false,
            Vacant(e) => {
                let new_account = Account::new(e.key().clone());
                let account_index: u32;
                if self.empty_account_indices.is_empty() {
                    account_index = self.accounts.len() as u32;
                    self.accounts.push(Some(new_account));
                } else {
                    account_index = self.empty_account_indices.remove(self.empty_account_indices.len() - 1);
                    let account: &mut Option<Account> = self.accounts.get_mut(account_index as usize).unwrap();
                    assert!(account.is_none());
                    *account = Some(new_account);
                }
                e.insert(AccountLocation::DefaultAccount(account_index));
                self.accounts_count = self.accounts_count + 1;
                true
            }
        }
    }

    pub fn create_sub_account(&mut self, caller: PrincipalId, sub_account_name: String) -> CreateSubAccountResponse {
        if !Self::validate_account_name(&sub_account_name) {
            CreateSubAccountResponse::NameTooLong
        } else if let Some(account) = self.try_get_account_mut_by_default_identifier(&AccountIdentifier::from(caller.clone())) {
            if account.sub_accounts.len() == (u8::MAX as usize) {
                CreateSubAccountResponse::SubAccountLimitExceeded
            } else {
                let sub_account_id = (1..u8::MAX)
                    .filter(|i| !account.sub_accounts.contains_key(i))
                    .next()
                    .unwrap();

                let sub_account = convert_byte_to_sub_account(sub_account_id);
                let sub_account_identifier = AccountIdentifier::new(caller, Some(sub_account));
                let named_sub_account = NamedSubAccount::new(
                    sub_account_name.clone(),
                    sub_account_identifier.clone());

                account.sub_accounts.insert(sub_account_id, named_sub_account);
                self.sub_accounts_count = self.sub_accounts_count + 1;

                CreateSubAccountResponse::Ok(SubAccountDetails {
                    name: sub_account_name,
                    sub_account,
                    account_identifier: sub_account_identifier
                })
            }
        } else {
            CreateSubAccountResponse::AccountNotFound
        }
    }

    pub fn rename_sub_account(&mut self, caller: PrincipalId, request: RenameSubAccountRequest) -> RenameSubAccountResponse {
        if !Self::validate_account_name(&request.new_name) {
            RenameSubAccountResponse::NameTooLong
        } else if let Some(account) = self.try_get_account_mut_by_default_identifier(&AccountIdentifier::from(caller)) {
            if let Some(sub_account) = account.sub_accounts.values_mut()
                .find(|sub_account| sub_account.account_identifier == request.account_identifier) {
                sub_account.name = request.new_name;
                RenameSubAccountResponse::Ok
            } else {
                RenameSubAccountResponse::SubAccountNotFound
            }
        } else {
            RenameSubAccountResponse::AccountNotFound
        }
    }

    pub fn register_hardware_wallet(&mut self, caller: PrincipalId, request: RegisterHardwareWalletRequest) -> RegisterHardwareWalletResponse {
        if !Self::validate_account_name(&request.name) {
            RegisterHardwareWalletResponse::NameTooLong
        } else if let Some(index) = self.try_get_account_index_by_default_identifier(&AccountIdentifier::from(caller)) {
            let account = self.accounts.get_mut(index as usize).unwrap().as_mut().unwrap();
            if account.hardware_wallet_accounts.len() == (u8::MAX as usize) {
                RegisterHardwareWalletResponse::HardwareWalletLimitExceeded
            } else {
                if account.hardware_wallet_accounts.iter().any(|hw| hw.account_identifier == request.account_identifier) {
                    RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered
                } else {
                    account.hardware_wallet_accounts.push(NamedHardwareWalletAccount {
                        name: request.name,
                        account_identifier: request.account_identifier,
                        transactions: Vec::new()
                    });
                    account.hardware_wallet_accounts.sort_unstable_by_key(|hw| hw.name.clone());

                    Self::link_hardware_wallet_to_account_index(&mut self.account_identifier_lookup, request.account_identifier, index);
                    self.hardware_wallet_accounts_count = self.hardware_wallet_accounts_count + 1;

                    RegisterHardwareWalletResponse::Ok
                }
            }
        } else {
            RegisterHardwareWalletResponse::AccountNotFound
        }
    }

    pub fn remove_hardware_wallet(&mut self, caller: PrincipalId, request: RemoveHardwareWalletRequest) -> RemoveHardwareWalletResponse {
        if let Some(account_index) = self.try_get_account_index_by_default_identifier(&AccountIdentifier::from(caller)) {
            let account = self.accounts.get_mut(account_index as usize).unwrap().as_mut().unwrap();

            if let Some(index) = account.hardware_wallet_accounts.iter()
                .enumerate()
                .find(|(_, hw)| hw.account_identifier == request.account_identifier)
                .map(|(index, _)| index) {

                account.hardware_wallet_accounts.remove(index);
                RemoveHardwareWalletResponse::Ok
            } else {
                RemoveHardwareWalletResponse::HardwareWalletNotFound
            }
        } else {
            RemoveHardwareWalletResponse::AccountNotFound
        }
    }

    pub fn append_transaction(
        &mut self,
        transfer: Transfer,
        block_height: BlockHeight,
        timestamp: TimeStamp,
    ) -> Result<bool, String> {
        let expected_block_height = self.get_next_required_block_height();
        if block_height != expected_block_height {
            return Err(format!(
                "Expected block height {}. Got block height {}",
                expected_block_height, block_height
            ));
        }

        let mut should_store_transaction = false;
        let transaction_index = self.get_next_transaction_index();

        match transfer {
            Burn { from, amount: _ } => {
                if self.try_add_transaction_to_account(from, transaction_index) {
                    should_store_transaction = true;
                }
            }
            Mint { to, amount: _ } => {
                if self.try_add_transaction_to_account(to, transaction_index) {
                    should_store_transaction = true;
                }
            }
            Send { from, to, amount: _, fee: _ } => {
                if self.try_add_transaction_to_account(from, transaction_index) {
                    should_store_transaction = true;
                }
                if self.try_add_transaction_to_account(to, transaction_index) {
                    should_store_transaction = true;
                }
            }
        }

        if should_store_transaction {
            self.transactions.push_back(Transaction::new(
                transaction_index,
                block_height,
                timestamp,
                transfer,
            ));
        }

        self.block_height_synced_up_to = Some(block_height);

        Ok(should_store_transaction)
    }

    pub fn mark_ledger_sync_complete(&mut self) {
        self.last_ledger_sync_timestamp_nanos = dfn_core::api::now()
            .duration_since(SystemTime::UNIX_EPOCH).unwrap().as_nanos() as u64;
    }

    pub fn get_transactions(&self, caller: PrincipalId, request: GetTransactionsRequest) -> GetTransactionsResponse {
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
        } else {
            if let Some(hardware_wallet_account) = account.hardware_wallet_accounts.iter().find(|a| a.account_identifier == request.account_identifier) {
                transactions = &hardware_wallet_account.transactions;
            } else if let Some(sub_account) = account.sub_accounts.values().find(|a| a.account_identifier == request.account_identifier) {
                transactions = &sub_account.transactions;
            } else {
                return GetTransactionsResponse {
                    transactions: vec![],
                    total: 0,
                };
            }
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
                    transfer: match transaction.transfer {
                        Burn { amount, from: _ } => TransferResult::Burn { amount },
                        Mint { amount, to: _ } => TransferResult::Mint { amount },
                        Send { from, to, amount, fee } => {
                            if &from == &account_identifier {
                                TransferResult::Send { to, amount, fee }
                            } else {
                                TransferResult::Receive { from, amount, fee }
                            }
                        }
                    }
                }
            })
            .collect();

        GetTransactionsResponse {
            transactions: results,
            total: transactions.len() as u32,
        }
    }

    pub fn get_next_transaction_index(&self) -> TransactionIndex {
        match self.transactions.back() {
            Some(t) => t.transaction_index + 1,
            None => 0
        }
    }

    pub fn get_next_required_block_height(&self) -> BlockHeight {
        match self.block_height_synced_up_to {
            Some(h) => h + 1,
            None => 0
        }
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn get_transactions_count(&self) -> u32 {
        self.transactions.len() as u32
    }

    pub fn prune_transactions(&mut self, count_to_prune: u32) -> u32 {
        let count_to_prune = min(count_to_prune, self.transactions.len() as u32);

        if count_to_prune > 0 {
            let transactions: Vec<_> = self.transactions
                .drain(RangeTo { end: count_to_prune as usize })
                .collect();

            let min_transaction_index = self.transactions.front().unwrap().transaction_index;

            for transaction in transactions {
                match transaction.transfer {
                    Burn { from, amount: _ } => self.prune_transactions_from_account(from, min_transaction_index),
                    Mint { to, amount: _ } => self.prune_transactions_from_account(to, min_transaction_index),
                    Send { from, to, amount: _, fee: _ } => {
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
        let timestamp_now_nanos = dfn_core::api::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_nanos() as u64;
        let duration_since_last_sync = Duration::from_nanos(timestamp_now_nanos - self.last_ledger_sync_timestamp_nanos);

        Stats {
            accounts_count: self.accounts_count,
            sub_accounts_count: self.sub_accounts_count,
            hardware_wallet_accounts_count: self.hardware_wallet_accounts_count,
            transactions_count: self.transactions.len() as u64,
            block_height_synced_up_to: self.block_height_synced_up_to.unwrap_or(0),
            earliest_transaction_timestamp_nanos: earliest_transaction.map_or(0, |t| t.timestamp.timestamp_nanos),
            earliest_transaction_block_height: earliest_transaction.map_or(0, |t| t.block_height),
            latest_transaction_timestamp_nanos: latest_transaction.map_or(0, |t| t.timestamp.timestamp_nanos),
            latest_transaction_block_height: latest_transaction.map_or(0, |t| t.block_height),
            seconds_since_last_ledger_sync: duration_since_last_sync.as_secs()
        }
    }

    fn try_add_transaction_to_account(&mut self, account_identifier: AccountIdentifier, transaction_index: TransactionIndex) -> bool {
        if let Some(location) = self.account_identifier_lookup.get(&account_identifier) {
            match location {
                AccountLocation::DefaultAccount(index) => {
                    let account = self.accounts.get_mut(*index as usize).unwrap().as_mut().unwrap();
                    account.append_default_account_transaction(transaction_index);
                },
                AccountLocation::SubAccount(index, sub_account) => {
                    let account = self.accounts.get_mut(*index as usize).unwrap().as_mut().unwrap();
                    account.append_sub_account_transaction(*sub_account, transaction_index);
                },
                AccountLocation::HardwareWallet(indexes) => {
                    for &index in indexes.iter() {
                        let account = self.accounts.get_mut(index as usize).unwrap().as_mut().unwrap();
                        account.append_hardware_wallet_transaction(account_identifier, transaction_index);
                    }
                }
            }

            true
        } else {
            false
        }
    }

    fn try_get_account_index_by_default_identifier(&self, account_identifier: &AccountIdentifier) -> Option<u32> {
        if let Some(location) = self.account_identifier_lookup.get(account_identifier) {
            if let AccountLocation::DefaultAccount(index) = location {
                return Some(*index)
            }
        }
        None
    }

    fn try_get_account_by_default_identifier(&self, account_identifier: &AccountIdentifier) -> Option<&Account> {
        if let Some(index) = self.try_get_account_index_by_default_identifier(account_identifier) {
            return Some(self.accounts.get(index as usize).unwrap().as_ref().unwrap());
        }
        None
    }

    fn try_get_account_mut_by_default_identifier(&mut self, account_identifier: &AccountIdentifier) -> Option<&mut Account> {
        if let Some(index) = self.try_get_account_index_by_default_identifier(account_identifier) {
            return Some(self.accounts.get_mut(index as usize).unwrap().as_mut().unwrap());
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
            },
            None => None
        }
    }

    fn link_hardware_wallet_to_account_index(
        account_identifier_lookup: &mut HashMap<AccountIdentifier, AccountLocation>,
        hardware_wallet_account_identifier: AccountIdentifier,
        account_index: u32) {
        match account_identifier_lookup.entry(hardware_wallet_account_identifier) {
            Occupied(mut e) => {
                if let AccountLocation::HardwareWallet(indexes) = e.get_mut() {
                    indexes.push(account_index);
                }
            },
            Vacant(e) => {
                e.insert(AccountLocation::HardwareWallet(vec!(account_index)));
            }
        };
    }

    fn validate_account_name(name: &str) -> bool {
        const ACCOUNT_NAME_MAX_LENGTH: usize = 24;

        name.len() <= ACCOUNT_NAME_MAX_LENGTH
    }

    fn prune_transactions_from_account(&mut self, account_identifier: AccountIdentifier, prune_blocks_previous_to: TransactionIndex) {
        fn prune_transactions_impl(transactions: &mut Vec<TransactionIndex>, prune_blocks_previous_to: TransactionIndex) {
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
                    if let Some(account) = self.accounts.get_mut(*index as usize).unwrap().as_mut() {
                        let transactions = &mut account.default_account_transactions;
                        prune_transactions_impl(transactions, prune_blocks_previous_to);
                    }
                },
                AccountLocation::SubAccount(index, sub_account) => {
                    if let Some(account) = self.accounts.get_mut(*index as usize).unwrap().as_mut() {
                        if let Some(sub_account) = &mut account.sub_accounts.get_mut(sub_account) {
                            let transactions = &mut sub_account.transactions;
                            prune_transactions_impl(transactions, prune_blocks_previous_to);
                        }
                    }
                },
                AccountLocation::HardwareWallet(indexes) => {
                    for index in indexes.into_iter() {
                        if let Some(account) = self.accounts.get_mut(*index as usize).unwrap().as_mut() {
                            if let Some(hardware_wallet_account) = account.hardware_wallet_accounts.iter_mut()
                                .find(|a| a.account_identifier == account_identifier) {
                                let transactions = &mut hardware_wallet_account.transactions;
                                prune_transactions_impl(transactions, prune_blocks_previous_to);
                            }
                        }
                    }
                }
            }
        }
    }
}

impl StableState for TransactionStore {
    fn encode(&self) -> Vec<u8> {
        Candid((Vec::from_iter(self.transactions.iter()), &self.accounts, &self.block_height_synced_up_to, &self.last_ledger_sync_timestamp_nanos)).into_bytes().unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let (transactions, accounts, block_height_synced_up_to, last_ledger_sync_timestamp_nanos): (Vec<Transaction>, Vec<Option<Account>>, Option<BlockHeight>, u64) =
            Candid::from_bytes(bytes).map(|c| c.0)?;

        let mut account_identifier_lookup: HashMap<AccountIdentifier, AccountLocation> = HashMap::new();
        let mut empty_account_indices: Vec<u32> = Vec::new();
        let mut accounts_count: u64 = 0;
        let mut sub_accounts_count: u64 = 0;
        let mut hardware_wallet_accounts_count: u64 = 0;

        for i in 0..accounts.len() {
            if let Some(a) = accounts.get(i).unwrap() {
                let index = i as u32;
                account_identifier_lookup.insert(a.account_identifier, AccountLocation::DefaultAccount(index));
                for (id, sa) in a.sub_accounts.iter() {
                    account_identifier_lookup.insert(sa.account_identifier, AccountLocation::SubAccount(index, *id));
                }
                for hw in a.hardware_wallet_accounts.iter() {
                    Self::link_hardware_wallet_to_account_index(&mut account_identifier_lookup, hw.account_identifier, index);
                }
                accounts_count = accounts_count + 1;
                sub_accounts_count = sub_accounts_count + a.sub_accounts.len() as u64;
                hardware_wallet_accounts_count = hardware_wallet_accounts_count + a.hardware_wallet_accounts.len() as u64;
            } else {
                empty_account_indices.push(i as u32);
            }
        }

        Ok(TransactionStore {
            account_identifier_lookup,
            transactions: VecDeque::from_iter(transactions),
            accounts,
            block_height_synced_up_to,
            empty_account_indices,
            accounts_count: 10,
            sub_accounts_count,
            hardware_wallet_accounts_count,
            last_ledger_sync_timestamp_nanos
        })
    }
}

impl Account {
    pub fn new(account_identifier: AccountIdentifier) -> Account {
        Account {
            account_identifier,
            default_account_transactions: Vec::new(),
            sub_accounts: HashMap::new(),
            hardware_wallet_accounts: Vec::new()
        }
    }

    pub fn append_default_account_transaction(&mut self, transaction_index: TransactionIndex) {
        self.default_account_transactions.push(transaction_index);
    }

    pub fn append_sub_account_transaction(&mut self, sub_account: u8, transaction_index: TransactionIndex) {
        self.sub_accounts.get_mut(&sub_account).unwrap().transactions.push(transaction_index);
    }

    pub fn append_hardware_wallet_transaction(&mut self, account_identifier: AccountIdentifier, transaction_index: TransactionIndex) {
        let account = self.hardware_wallet_accounts.iter_mut()
            .find(|a| a.account_identifier == account_identifier)
            .unwrap();

        account.transactions.push(transaction_index);
    }
}

impl Transaction {
    pub fn new(transaction_index: TransactionIndex, block_height: BlockHeight, timestamp: TimeStamp, transfer: Transfer) -> Transaction {
        Transaction {
            transaction_index,
            block_height,
            timestamp,
            transfer
        }
    }
}

impl NamedSubAccount {
    pub fn new(name: String, account_identifier: AccountIdentifier) -> NamedSubAccount {
        NamedSubAccount {
            name,
            account_identifier,
            transactions: Vec::new()
        }
    }
}

fn convert_byte_to_sub_account(byte: u8) -> Subaccount {
    let mut bytes = [0u8; 32];
    bytes[31] = byte;
    Subaccount(bytes)
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
    transfer: TransferResult,
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
    block_height_synced_up_to: u64,
    earliest_transaction_timestamp_nanos: u64,
    earliest_transaction_block_height: BlockHeight,
    latest_transaction_timestamp_nanos: u64,
    latest_transaction_block_height: BlockHeight,
    seconds_since_last_ledger_sync: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use ledger_canister::ICPTs;

    const TEST_ACCOUNT_1: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
    const TEST_ACCOUNT_2: &str = "c2u3y-w273i-ols77-om7wu-jzrdm-gxxz3-b75cc-3ajdg-mauzk-hm5vh-jag";
    const TEST_ACCOUNT_3: &str = "347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe";
    const TEST_ACCOUNT_4: &str = "zrmyx-sbrcv-rod5f-xyd6k-letwb-tukpj-edhrc-sqash-lddmc-7qypw-yqe";
    const TEST_ACCOUNT_5: &str = "2fzwl-cu3hl-bawo2-idwrw-7yygk-uccms-cbo3a-c6kqt-lnk3j-mewg3-hae";
    const TEST_ACCOUNT_6: &str = "4gb44-uya57-c2v6u-fcz5v-qrpwl-wqkmf-o3fd3-esjio-kpysm-r5xxh-fqe";

    #[test]
    fn get_non_existant_account_produces_empty_results() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let store = TransactionStore::default();

        let results = store.get_transactions(principal, GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        });

        assert_eq!(0, results.total);
        assert_eq!(0, results.transactions.len());
    }

    #[test]
    fn get_transactions_1() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let store = setup_test_store();

        let results = store.get_transactions(principal, GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        });

        assert_eq!(4, results.total);
        assert_eq!(4, results.transactions.len());
    }

    #[test]
    fn get_transactions_2() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
        let store = setup_test_store();

        let results = store.get_transactions(principal, GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        });

        assert_eq!(1, results.total);
        assert_eq!(1, results.transactions.len());
    }

    #[test]
    fn get_transactions_returns_expected_page() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let store = setup_test_store();

        let results = store.get_transactions(principal, GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 2,
            page_size: 2,
        });

        assert_eq!(4, results.total);
        assert_eq!(2, results.transactions.len());
    }

    #[test]
    fn create_sub_account() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        store.create_sub_account(principal, "AAA".to_string());
        store.create_sub_account(principal, "BBB".to_string());
        store.create_sub_account(principal, "CCC".to_string());

        let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

        assert_eq!(3, sub_accounts.len());
        assert_eq!("AAA", sub_accounts[0].name);
        assert_eq!("BBB", sub_accounts[1].name);
        assert_eq!("CCC", sub_accounts[2].name);
    }

    #[test]
    fn rename_sub_account() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        store.create_sub_account(principal, "AAA".to_string());
        store.create_sub_account(principal, "BBB".to_string());
        store.create_sub_account(principal, "CCC".to_string());

        let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

        let result = store.rename_sub_account(
            principal,
            RenameSubAccountRequest { account_identifier: sub_accounts[1].account_identifier, new_name: "BBB123".to_string() });

        assert!(matches!(result, RenameSubAccountResponse::Ok));

        let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

        assert_eq!("BBB123".to_string(), sub_accounts[1].name);
    }

    #[test]
    fn register_hardware_wallet() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        let hw1 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());
        let hw2 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap());

        let res1 = store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW1".to_string(), account_identifier: hw1 });
        let res2 = store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW2".to_string(), account_identifier: hw2 });

        assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
        assert!(matches!(res2, RegisterHardwareWalletResponse::Ok));

        let account = store.get_account(principal).unwrap();

        assert_eq!(2, account.hardware_wallet_accounts.len());
        assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
        assert_eq!("HW2", account.hardware_wallet_accounts[1].name);
        assert_eq!(hw1, account.hardware_wallet_accounts[0].account_identifier);
        assert_eq!(hw2, account.hardware_wallet_accounts[1].account_identifier);
    }

    #[test]
    fn register_hardware_wallet_hardware_wallet_already_registered() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        let hw1 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());

        let res1 = store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW1".to_string(), account_identifier: hw1 });
        let res2 = store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW2".to_string(), account_identifier: hw1 });

        assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
        assert!(matches!(res2, RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered));

        let account = store.get_account(principal).unwrap();

        assert_eq!(1, account.hardware_wallet_accounts.len());
        assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
        assert_eq!(hw1, account.hardware_wallet_accounts[0].account_identifier);
    }

    #[test]
    fn remove_hardware_wallet() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        let hw1 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());
        let hw2 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap());

        store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW1".to_string(), account_identifier: hw1 });
        store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW2".to_string(), account_identifier: hw2 });

        let result = store.remove_hardware_wallet(principal, RemoveHardwareWalletRequest { account_identifier: hw1 });

        assert!(matches!(result, RemoveHardwareWalletResponse::Ok));

        let account = store.get_account(principal).unwrap();

        assert_eq!(1, account.hardware_wallet_accounts.len());
        assert_eq!("HW2", account.hardware_wallet_accounts[0].name);
        assert_eq!(hw2, account.hardware_wallet_accounts[0].account_identifier);
    }

    #[test]
    fn hardware_wallet_transactions_tracked_correctly() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = setup_test_store();

        let hw = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());

        store.register_hardware_wallet(principal, RegisterHardwareWalletRequest { name: "HW".to_string(), account_identifier: hw });

        let transfer = Mint {
            amount: ICPTs::from_icpts(1).unwrap(),
            to: hw,
        };
        store.append_transaction(transfer, 4, TimeStamp { timestamp_nanos: 100 }).unwrap();

        let transfer = Mint {
            amount: ICPTs::from_icpts(2).unwrap(),
            to: hw,
        };
        store.append_transaction(transfer, 5, TimeStamp { timestamp_nanos: 100 }).unwrap();

        let get_transactions_request = GetTransactionsRequest {
            account_identifier: hw,
            offset: 0,
            page_size: 10
        };

        let response = store.get_transactions(principal, get_transactions_request);

        assert_eq!(2, response.total);
        assert_eq!(5, response.transactions[0].block_height);
        assert_eq!(4, response.transactions[1].block_height);
    }

    #[test]
    fn prune_transactions() {
        let mut store = setup_test_store();
        let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();

        let default_account = AccountIdentifier::from(principal1);
        let hw_account = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());
        let unknown_account = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap());

        let sub_account = if let CreateSubAccountResponse::Ok(response) = store.create_sub_account(principal2, "SUB1".to_string()) {
            response.account_identifier
        } else {
            panic!("Unable to create sub account");
        };

        store.register_hardware_wallet(principal1, RegisterHardwareWalletRequest { name: "HW".to_string(), account_identifier: hw_account });

        let timestamp = TimeStamp {
            timestamp_nanos: 100
        };
        for _ in 0..10 {
            let transfer1 = Burn {
                amount: ICPTs::from_e8s(100_000),
                from: default_account,
            };
            store.append_transaction(transfer1, store.get_next_required_block_height(), timestamp).unwrap();

            let transfer2 = Send {
                amount: ICPTs::from_e8s(10_000),
                from: default_account,
                to: sub_account,
                fee: ICPTs::from_e8s(1_000),
            };
            store.append_transaction(transfer2, store.get_next_required_block_height(), timestamp).unwrap();

            let transfer3 = Mint {
                amount: ICPTs::from_e8s(1_000_000_000),
                to: hw_account,
            };
            store.append_transaction(transfer3, store.get_next_required_block_height(), timestamp).unwrap();

            let transfer4 = Mint {
                amount: ICPTs::from_e8s(1_000_000_000),
                to: unknown_account,
            };
            store.append_transaction(transfer4, store.get_next_required_block_height(), timestamp).unwrap();
        }

        let original_block_heights = store.transactions.iter().map(|t| t.block_height).collect_vec();
        assert_eq!(20, store.prune_transactions(20));
        let pruned_block_heights = store.transactions.iter().map(|t| t.block_height).collect_vec();

        assert_eq!(original_block_heights[20..].iter().cloned().collect_vec(), pruned_block_heights);

        let mut transaction_indexes_remaining = Vec::new();
        for account in store.accounts.iter().map(|a| a.as_ref().unwrap()) {
            transaction_indexes_remaining.append(account.default_account_transactions.clone().as_mut());

            for sub_account in account.sub_accounts.values() {
                transaction_indexes_remaining.append(sub_account.transactions.clone().as_mut());
            }

            for hw_account in account.hardware_wallet_accounts.iter() {
                transaction_indexes_remaining.append(hw_account.transactions.clone().as_mut());
            }
        }

        transaction_indexes_remaining.sort();
        transaction_indexes_remaining.dedup();

        let block_heights_remaining = transaction_indexes_remaining.iter().map(|t| store.get_transaction(*t).unwrap().block_height).collect_vec();

        assert_eq!(pruned_block_heights, block_heights_remaining);
    }

    #[test]
    fn sub_account_name_too_long() {
        let mut store = setup_test_store();

        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

        let res1 = store.create_sub_account(principal, "ABCDEFGHIJKLMNOPQRSTUVWX".to_string());
        let res2 = store.create_sub_account(principal, "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string());

        assert!(matches!(res1, CreateSubAccountResponse::Ok(_)));
        assert!(matches!(res2, CreateSubAccountResponse::NameTooLong));
    }

    #[test]
    fn hardware_wallet_account_name_too_long() {
        let mut store = setup_test_store();

        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let hw_account1 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_3).unwrap());
        let hw_account2 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap());

        let res1 = store.register_hardware_wallet(
            principal,
            RegisterHardwareWalletRequest { name: "ABCDEFGHIJKLMNOPQRSTUVWX".to_string(), account_identifier: hw_account1 });

        let res2 = store.register_hardware_wallet(
            principal,
            RegisterHardwareWalletRequest { name: "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string(), account_identifier: hw_account2 });

        assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
        assert!(matches!(res2, RegisterHardwareWalletResponse::NameTooLong));
    }

    #[test]
    fn get_stats() {
        let mut store = setup_test_store();

        let stats = store.get_stats();
        assert_eq!(2, stats.accounts_count);
        assert_eq!(0, stats.sub_accounts_count);
        assert_eq!(0, stats.hardware_wallet_accounts_count);
        assert_eq!(4, stats.transactions_count);
        assert_eq!(3, stats.block_height_synced_up_to);
        assert_eq!(0, stats.earliest_transaction_block_height);
        assert_eq!(3, stats.latest_transaction_block_height);
        assert!(stats.seconds_since_last_ledger_sync > 1_000_000_000);

        let principal3 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
        let principal4 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

        store.add_account(principal3);
        store.add_account(principal4);

        let stats = store.get_stats();

        assert_eq!(4, stats.accounts_count);

        for i in 1..10 {
            store.create_sub_account(principal3, i.to_string());
            let stats = store.get_stats();
            assert_eq!(i, stats.sub_accounts_count);
        }

        let hw1 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_5).unwrap());
        let hw2 = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_6).unwrap());
        store.register_hardware_wallet(principal3, RegisterHardwareWalletRequest { name: "HW1".to_string(), account_identifier: hw1 });
        store.register_hardware_wallet(principal4, RegisterHardwareWalletRequest { name: "HW2".to_string(), account_identifier: hw2 });

        let stats = store.get_stats();
        assert_eq!(2, stats.hardware_wallet_accounts_count);

        store.mark_ledger_sync_complete();
        let stats = store.get_stats();
        assert!(stats.seconds_since_last_ledger_sync < 10);
    }

    fn setup_test_store() -> TransactionStore {
        let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
        let account_identifier1 = AccountIdentifier::from(principal1);
        let account_identifier2 = AccountIdentifier::from(principal2);
        let mut store = TransactionStore::default();
        store.add_account(principal1);
        store.add_account(principal2);
        let timestamp = TimeStamp {
            timestamp_nanos: 100
        };
        {
            let transfer = Mint {
                amount: ICPTs::from_e8s(1_000_000_000),
                to: account_identifier1,
            };
            store.append_transaction(transfer, 0, timestamp).unwrap();
        }
        {
            let transfer = Mint {
                amount: ICPTs::from_e8s(1_000_000_000),
                to: account_identifier1,
            };
            store.append_transaction(transfer, 1, timestamp).unwrap();
        }
        {
            let transfer = Burn {
                amount: ICPTs::from_e8s(500_000_000),
                from: account_identifier1,
            };
            store.append_transaction(transfer, 2, timestamp).unwrap();
        }
        {
            let transfer = Send {
                amount: ICPTs::from_e8s(300_000_000),
                fee: ICPTs::from_e8s(1_000),
                from: account_identifier1,
                to: account_identifier2,
            };
            store.append_transaction(transfer, 3, timestamp).unwrap();
        }
        store
    }
}
