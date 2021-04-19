use candid::CandidType;
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
use std::collections::{hash_map::Entry::{Occupied, Vacant}, HashMap, VecDeque};
use std::iter::FromIterator;

type TransactionIndex = u64;

#[derive(Default)]
pub struct TransactionStore {
    identifier_to_account_index_and_sub_account_map: HashMap<AccountIdentifier, (u32, Option<u8>)>,
    transactions: VecDeque<Transaction>,
    accounts: Vec<Option<Account>>,
    block_height_synced_up_to: Option<BlockHeight>,

    // Use these up first before appending to the accounts Vec
    empty_account_indices: Vec<u32>,
}

#[derive(CandidType, Deserialize)]
struct Account {
    account_identifier: AccountIdentifier,
    default_account_transactions: Vec<TransactionIndex>,
    sub_accounts: HashMap<u8, NamedSubAccount>
}

#[derive(CandidType, Deserialize)]
struct NamedSubAccount {
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
    Ok(SubAccountResponse),
    AccountNotFound,
    SubAccountLimitExceeded
}

#[derive(CandidType)]
pub struct SubAccountResponse {
    name: String,
    sub_account: Subaccount,
    account_identifier: AccountIdentifier
}

impl TransactionStore {
    pub fn encode(&self) -> Vec<u8> {
        Candid((Vec::from_iter(self.transactions.iter()), &self.accounts, &self.block_height_synced_up_to)).into_bytes().unwrap()
    }

    pub fn decode(bytes: &[u8]) -> Result<Self, String> {
        let (transactions, accounts, block_height_synced_up_to): (Vec<Transaction>, Vec<Option<Account>>, Option<BlockHeight>) =
            Candid::from_bytes(bytes.to_vec()).map(|c| c.0)?;

        let mut identifier_to_account_index_and_sub_account_map: HashMap<AccountIdentifier, (u32, Option<u8>)> = HashMap::new();
        let mut empty_account_indices: Vec<u32> = Vec::new();

        for i in 0..accounts.len() {
            if let Some(a) = accounts.get(i).unwrap() {
                let index = i as u32;
                identifier_to_account_index_and_sub_account_map.insert(a.account_identifier, (index, None));
                for (id, sa) in a.sub_accounts.iter() {
                    identifier_to_account_index_and_sub_account_map.insert(sa.account_identifier, (index, Some(*id)));
                }
            } else {
                empty_account_indices.push(i as u32);
            }
        }

        Ok(TransactionStore {
            identifier_to_account_index_and_sub_account_map,
            transactions: VecDeque::from_iter(transactions),
            accounts,
            block_height_synced_up_to,
            empty_account_indices
        })
    }

    pub fn check_account_exists(&self, caller: PrincipalId) -> bool {
        self.identifier_to_account_index_and_sub_account_map.contains_key(&AccountIdentifier::from(caller))
    }

    pub fn add_account(&mut self, caller: PrincipalId) -> bool {
        match self.identifier_to_account_index_and_sub_account_map.entry(AccountIdentifier::from(caller)) {
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
                e.insert((account_index, None));
                true
            }
        }
    }

    pub fn create_sub_account(&mut self, caller: PrincipalId, sub_account_name: String) -> CreateSubAccountResponse {
        if let Some(account) = self.try_get_account_mut(&AccountIdentifier::from(caller.clone())) {
            if account.sub_accounts.len() == (u8::max_value() as usize) {
                CreateSubAccountResponse::SubAccountLimitExceeded
            } else {
                let sub_account_id = (1..u8::max_value())
                    .filter(|i| !account.sub_accounts.contains_key(i))
                    .next()
                    .unwrap();

                let sub_account = convert_byte_to_sub_account(sub_account_id);
                let sub_account_identifier = AccountIdentifier::new(caller, Some(sub_account));
                let named_sub_account = NamedSubAccount::new(
                    sub_account_name.clone(),
                    sub_account_identifier.clone());
                account.sub_accounts.insert(sub_account_id, named_sub_account);

                CreateSubAccountResponse::Ok(SubAccountResponse {
                    name: sub_account_name,
                    sub_account,
                    account_identifier: sub_account_identifier
                })
            }
        } else {
            CreateSubAccountResponse::AccountNotFound
        }
    }

    pub fn get_sub_accounts(&self, caller: PrincipalId) -> Vec<SubAccountResponse> {
        if let Some(account) = self.try_get_account(&AccountIdentifier::from(caller)) {
            account.sub_accounts
                .iter()
                .sorted_by_key(|(id, _)| *id)
                .map(|(id, sa)| SubAccountResponse {
                    name: sa.name.clone(),
                    sub_account: convert_byte_to_sub_account(*id),
                    account_identifier: sa.account_identifier
                })
                .collect()
        } else {
            Vec::new()
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

    pub fn get_transactions(&self, caller: PrincipalId, request: GetTransactionsRequest) -> GetTransactionsResponse {
        let account_identifier = AccountIdentifier::from(caller);
        let account = self.try_get_account(&account_identifier);
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
            if let Some(sub_account) = account.sub_accounts.values().find(|a| a.account_identifier == request.account_identifier) {
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

    fn try_add_transaction_to_account(&mut self, account_identifier: AccountIdentifier, transaction_index: TransactionIndex) -> bool {
        if let Some((account_index, sub_account)) = self.try_get_account_index_and_sub_account(&account_identifier) {
            let account = self.accounts.get_mut(account_index as usize).unwrap().as_mut().unwrap();
            account.append_transaction(sub_account, transaction_index);
            true
        } else {
            false
        }
    }

    fn try_get_account(&self, account_identifier: &AccountIdentifier) -> Option<&Account> {
        match self.try_get_account_index_and_sub_account(account_identifier) {
            Some((index, _)) => self.accounts.get(index as usize).unwrap().as_ref(),
            None => None
        }
    }

    fn try_get_account_mut(&mut self, account_identifier: &AccountIdentifier) -> Option<&mut Account> {
        match self.try_get_account_index_and_sub_account(account_identifier) {
            Some((index, _)) => self.accounts.get_mut(index as usize).unwrap().as_mut(),
            None => None
        }
    }

    fn try_get_account_index_and_sub_account(&self, account_identifier: &AccountIdentifier) -> Option<(u32, Option<u8>)> {
        self.identifier_to_account_index_and_sub_account_map.get(account_identifier).cloned()
    }

    fn get_transaction(&self, transaction_index: TransactionIndex) -> Option<&Transaction> {
        match self.transactions.front() {
            Some(t) => {
                let offset = t.transaction_index;
                self.transactions.get((transaction_index - offset) as usize)
            },
            None => None
        }
    }
}

impl Account {
    pub fn new(account_identifier: AccountIdentifier) -> Account {
        Account {
            account_identifier,
            sub_accounts: HashMap::new(),
            default_account_transactions: Vec::new()
        }
    }

    pub fn append_transaction(&mut self, sub_account: Option<u8>, transaction_index: TransactionIndex) {
        match sub_account {
            Some(sa) => self.sub_accounts.get_mut(&sa).unwrap().transactions.push(transaction_index),
            None => self.default_account_transactions.push(transaction_index)
        }
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use ledger_canister::ICPTs;

    const TEST_ACCOUNT_1: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
    const TEST_ACCOUNT_2: &str = "c2u3y-w273i-ols77-om7wu-jzrdm-gxxz3-b75cc-3ajdg-mauzk-hm5vh-jag";

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

        let results = store.get_sub_accounts(principal);

        assert_eq!(3, results.len());
        assert_eq!("AAA", results[0].name);
        assert_eq!("BBB", results[1].name);
        assert_eq!("CCC", results[2].name);
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
            secs: 100,
            nanos: 100,
        };
        {
            let transfer = Mint {
                amount: ICPTs::from_doms(1_000_000_000),
                to: account_identifier1,
            };
            store.append_transaction(transfer, 0, timestamp).unwrap();
        }
        {
            let transfer = Mint {
                amount: ICPTs::from_doms(1_000_000_000),
                to: account_identifier1,
            };
            store.append_transaction(transfer, 1, timestamp).unwrap();
        }
        {
            let transfer = Burn {
                amount: ICPTs::from_doms(500_000_000),
                from: account_identifier1,
            };
            store.append_transaction(transfer, 2, timestamp).unwrap();
        }
        {
            let transfer = Send {
                amount: ICPTs::from_doms(300_000_000),
                fee: ICPTs::from_doms(1_000),
                from: account_identifier1,
                to: account_identifier2,
            };
            store.append_transaction(transfer, 3, timestamp).unwrap();
        }
        store
    }
}
