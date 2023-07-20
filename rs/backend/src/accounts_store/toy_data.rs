//! Test data for unit tests and test networks.

use crate::accounts_store::{AccountsStore, PrincipalId, RegisterHardwareWalletRequest};


impl AccountsStore {
    pub fn create_toy_accounts(&mut self, num_accounts: u64) {
        const MAX_SUB_ACCOUNTS_PER_ACCOUNT: u64 = 3;
        const MAX_HARDWARE_WALLETS_PER_ACCOUNT: u64 = 1;
        let num_existing_accounts = self.accounts.len() as u64;
        for toy_account_index in num_existing_accounts..(num_existing_accounts + num_accounts) {
            let account = PrincipalId::new_user_test_id(toy_account_index);
            self.add_account(account);
            // Successive accounts have 0, 1, 2 ... SUB_ACCOUNTS_PER_ACCOUNT-1 sub accounts, restarting at 0.
            for subaccount_index in 0..(toy_account_index % MAX_SUB_ACCOUNTS_PER_ACCOUNT) {
                self.create_sub_account(account, format!("sub_account_{toy_account_index}_{subaccount_index}"));
            }
            // Successive accounts have 0, 1, 2 ... HARDWARE_WALLETS_PER_ACCOUNT-1 hardware wallets, restarting at 0.
            for hardware_wallet_index in 0..(toy_account_index % MAX_HARDWARE_WALLETS_PER_ACCOUNT) {
                self.register_hardware_wallet(account, RegisterHardwareWalletRequest{name: format!("hw_wallet_{toy_account_index}_{hardware_wallet_index}"), principal: account});
            }
        }
    }
}

#[allow(dead_code)]
fn large_accounts_store(num_accounts: u64) -> AccountsStore {
    let mut accounts_store = AccountsStore::default();
    accounts_store.create_toy_accounts(num_accounts);
    accounts_store

    /* 
    AccountsStore {
        accounts: HashMap<Vec<u8>, Account>,
        hardware_wallets_and_sub_accounts: HashMap<AccountIdentifier, AccountWrapper>,  
        // pending_transactions: HashMap<(from, to), (TransactionType, timestamp_ms_since_epoch)>
        pending_transactions: HashMap<(AccountIdentifier, AccountIdentifier), (TransactionType, u64)>,
    
        transactions: VecDeque<Transaction>,
        neuron_accounts: HashMap<AccountIdentifier, NeuronDetails>,
        block_height_synced_up_to: Option<BlockIndex>,
        multi_part_transactions_processor: MultiPartTransactionsProcessor,
    
        sub_accounts_count: u64,
        hardware_wallet_accounts_count: u64,
        last_ledger_sync_timestamp_nanos: u64,
        neurons_topped_up_count: u64,
    }
    */
}

#[test]
fn should_be_able_to_create_large_accounts_store() {
    let num_accounts = 100_000;
    let accounts_store = large_accounts_store(num_accounts);
    assert_eq!(num_accounts, accounts_store.accounts.len() as u64);
}
