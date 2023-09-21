//! Test data for unit tests and test networks.

use crate::accounts_store::{
    convert_byte_to_sub_account, schema::AccountsDbTrait, Account, AccountIdentifier, AccountsStore,
    AttachCanisterRequest, CanisterId, Memo, NamedCanister, NamedHardwareWalletAccount, NamedSubAccount, NeuronDetails,
    NeuronId, Operation, PrincipalId, RegisterHardwareWalletRequest, TimeStamp, Tokens, Transaction, TransactionType,
};
use std::collections::HashMap;

const MAX_SUB_ACCOUNTS_PER_ACCOUNT: u64 = 3; // Toy accounts have between 0 and this many subaccounts.
const MAX_HARDWARE_WALLETS_PER_ACCOUNT: u64 = 1; // Toy accounts have between 0 and this many hardware wallets.
const MAX_CANISTERS_PER_ACCOUNT: u64 = 2; // Toy accounts have between 0 and this many canisters.
const NEURONS_PER_ACCOUNT: f32 = 0.3;
const TRANSACTIONS_PER_ACCOUNT: f32 = 3.0;

/// A specification for how large a toy account should be.
#[derive(Default)]
pub struct ToyAccountSize {
    pub sub_accounts: usize,
    pub canisters: usize,
    pub default_account_transactions: usize,
    pub sub_account_transactions: usize,
    pub hardware_wallets: usize,
}

/// Creates a toy account data structure.
///
/// Warning: The meaning of the data in the account is in no way coherent or semantically
/// correct.
pub fn toy_account(account_index: u64, size: ToyAccountSize) -> Account {
    let principal = PrincipalId::new_user_test_id(account_index);
    let account_identifier = AccountIdentifier::from(principal);
    let mut account = Account {
        principal: Some(principal),
        account_identifier,
        default_account_transactions: Vec::new(),
        sub_accounts: HashMap::new(),
        hardware_wallet_accounts: Vec::new(),
        canisters: Vec::new(),
    };
    // Creates linked sub-accounts:
    // Note: Successive accounts have 0, 1, 2 ... MAX_SUB_ACCOUNTS_PER_ACCOUNT-1 sub accounts, restarting at 0.
    for sub_account_index in 0..size.sub_accounts as u8 {
        let sub_account_name = format!("sub_account_{account_index}_{sub_account_index}");
        let sub_account = convert_byte_to_sub_account(sub_account_index);
        let sub_account_identifier = AccountIdentifier::new(principal, Some(sub_account));
        let named_sub_account = NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);
        account.sub_accounts.insert(sub_account_index, named_sub_account);
        // TODO: Add sub-account transactions.
    }
    // Attaches canisters to the account.
    for canister_index in 0..size.canisters {
        let canister_id = CanisterId::from(canister_index as u64);
        let canister = NamedCanister {
            name: format!("canister_{account_index}_{canister_index}"),
            canister_id,
        };
        account.canisters.push(canister);
    }
    for transaction_index in 0..size.default_account_transactions as u64 {
        // Warning: This is in no way semantically meaningful or correct.  It is just data to fill up memory and exercise upgrades.
        // Note: Normally a transaction would be added to the list of transactions and here we
        // would have the index of that transaction.  In this toy data, the index is
        // meaningless.
        account.default_account_transactions.push(transaction_index);
    }
    for hardware_wallet_index in 0..size.hardware_wallets as u64 {
        let principal = PrincipalId::new_user_test_id(account_index + hardware_wallet_index + 999); // Toy hardware wallet principal.
        let hardware_wallet = NamedHardwareWalletAccount {
            name: format!("hw_wallet_{account_index}_{hardware_wallet_index}"),
            principal: principal,
            transactions: Vec::new(),
        };
        account.hardware_wallet_accounts.push(hardware_wallet);
    }

    // FIN
    account
}

impl AccountsStore {
    /// Creates the given number of toy accounts, with linked sub-accounts, hardware wallets, pending transactions, and canisters.
    ///
    /// # Returns
    /// - The index of the first account created by this call.  The account indices are `first...first+num_accounts-1`.
    pub fn create_toy_accounts(&mut self, num_accounts: u64) -> u64 {
        // If we call this function twice, we don't want to create the same accounts again, so we index from the number of existing accounts.
        let num_existing_accounts = self.accounts_db.db_accounts_len();
        let (index_range_start, index_range_end) = (num_existing_accounts, (num_existing_accounts + num_accounts));
        let mut neurons_needed: f32 = 0.0;
        let mut neurons_created: f32 = 0.0;
        let mut transactions_needed: f32 = 0.0;
        let mut transactions_created: f32 = 0.0;
        // Creates accounts:
        for toy_account_index in index_range_start..index_range_end {
            let account = PrincipalId::new_user_test_id(toy_account_index);
            self.add_account(account);
            // Creates linked sub-accounts:
            // Note: Successive accounts have 0, 1, 2 ... MAX_SUB_ACCOUNTS_PER_ACCOUNT-1 sub accounts, restarting at 0.
            for subaccount_index in 0..(toy_account_index % (MAX_SUB_ACCOUNTS_PER_ACCOUNT + 1)) {
                self.create_sub_account(account, format!("sub_account_{toy_account_index}_{subaccount_index}"));
            }
            // Creates linked hardware wallets:
            // Note: Successive accounts have 0, 1, 2 ... MAX_HARDWARE_WALLETS_PER_ACCOUNT-1 hardware wallets, restarting at 0.
            for hardware_wallet_index in 0..(toy_account_index % (MAX_HARDWARE_WALLETS_PER_ACCOUNT + 1)) {
                let principal = PrincipalId::new_user_test_id(toy_account_index + hardware_wallet_index + 999); // Toy hardware wallet principal.
                self.register_hardware_wallet(
                    account,
                    RegisterHardwareWalletRequest {
                        name: format!("hw_wallet_{toy_account_index}_{hardware_wallet_index}"),
                        principal,
                    },
                );
            }
            // Attaches canisters to the account:
            for canister_index in 0..(toy_account_index % (MAX_CANISTERS_PER_ACCOUNT + 1)) {
                let canister_id = CanisterId::from(toy_account_index * MAX_CANISTERS_PER_ACCOUNT + canister_index); //PrincipalId::new_user_test_id(toy_account_index + canister_index + 1);
                let attach_canister_request = AttachCanisterRequest {
                    name: format!("canister_{toy_account_index}_{canister_index}"),
                    canister_id,
                };
                self.attach_canister(account, attach_canister_request);
            }
            // Creates neurons
            neurons_needed += NEURONS_PER_ACCOUNT;
            while neurons_created < neurons_needed {
                // Warning: This is in no way a realistic neuron.
                neurons_created += 1.0;
                let neuron = NeuronDetails {
                    account_identifier: AccountIdentifier::from(PrincipalId::new_user_test_id(9)),
                    principal: PrincipalId::new_user_test_id(10),
                    memo: Memo(11),
                    neuron_id: Some(NeuronId(12)),
                };
                self.neuron_accounts.insert(
                    AccountIdentifier::from(PrincipalId::new_user_test_id(toy_account_index)),
                    neuron,
                );
            }
            // Creates transactions
            transactions_needed += TRANSACTIONS_PER_ACCOUNT;
            while transactions_created < transactions_needed {
                transactions_created += 1.0;
                // Warning: This is in no way semantically meaningful or correct.  It is just data to fill up memory and exercise upgrades.
                self.transactions.push_back(Transaction {
                    transaction_index: 9,
                    block_height: 10,
                    timestamp: TimeStamp::from_nanos_since_unix_epoch(341),
                    memo: Memo(11),
                    transfer: Operation::Transfer {
                        to: AccountIdentifier::from(PrincipalId::new_user_test_id(12)),
                        amount: Tokens::from_e8s(10_000),
                        from: AccountIdentifier::from(PrincipalId::new_user_test_id(14)),
                        fee: Tokens::from_e8s(10_001),
                    },
                    transaction_type: Some(TransactionType::Transfer),
                });
            }
        }
        index_range_start
    }

    /// Creates an account store with the given number of test accounts.
    #[cfg(test)]
    pub fn with_toy_accounts(num_accounts: u64) -> AccountsStore {
        let mut accounts_store = AccountsStore::default();
        accounts_store.create_toy_accounts(num_accounts);
        accounts_store
    }
}

#[test]
fn should_be_able_to_create_large_accounts_store() {
    let num_accounts = 10_000;
    let accounts_store = AccountsStore::with_toy_accounts(num_accounts);
    assert_eq!(num_accounts, accounts_store.accounts_db.db_accounts_len());
}
