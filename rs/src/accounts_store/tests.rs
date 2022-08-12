use super::*;
use ledger_canister::Tokens;
use std::str::FromStr;

const TEST_ACCOUNT_1: &str = "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe";
const TEST_ACCOUNT_2: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
const TEST_ACCOUNT_3: &str = "347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe";
const TEST_ACCOUNT_4: &str = "zrmyx-sbrcv-rod5f-xyd6k-letwb-tukpj-edhrc-sqash-lddmc-7qypw-yqe";
const TEST_ACCOUNT_5: &str = "2fzwl-cu3hl-bawo2-idwrw-7yygk-uccms-cbo3a-c6kqt-lnk3j-mewg3-hae";
const TEST_ACCOUNT_6: &str = "4gb44-uya57-c2v6u-fcz5v-qrpwl-wqkmf-o3fd3-esjio-kpysm-r5xxh-fqe";

#[test]
fn get_non_existant_account_produces_empty_results() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let store = AccountsStore::default();

    let results = store.get_transactions(
        principal,
        GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        },
    );

    assert_eq!(0, results.total);
    assert_eq!(0, results.transactions.len());
}

#[test]
fn get_transactions_1() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let store = setup_test_store();

    let results = store.get_transactions(
        principal,
        GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        },
    );

    assert_eq!(4, results.total);
    assert_eq!(4, results.transactions.len());
}

#[test]
fn get_transactions_2() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
    let store = setup_test_store();

    let results = store.get_transactions(
        principal,
        GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 0,
            page_size: 10,
        },
    );

    assert_eq!(1, results.total);
    assert_eq!(1, results.transactions.len());
}

#[test]
fn get_transactions_returns_expected_page() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let store = setup_test_store();

    let results = store.get_transactions(
        principal,
        GetTransactionsRequest {
            account_identifier: AccountIdentifier::from(principal),
            offset: 2,
            page_size: 2,
        },
    );

    assert_eq!(4, results.total);
    assert_eq!(2, results.transactions.len());
}

#[test]
fn add_account_adds_principal_and_sets_transaction_types() {
    let mut store = setup_test_store();

    let principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let account_identifier = AccountIdentifier::new(principal, None);

    let account = Account {
        principal: None,
        account_identifier,
        default_account_transactions: Vec::default(),
        sub_accounts: HashMap::default(),
        hardware_wallet_accounts: Vec::default(),
        canisters: Vec::default(),
    };

    store.accounts.insert(account_identifier.to_vec(), account);

    let transfer = Transfer {
        from: account_identifier,
        to: AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap()),
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            transfer,
            Memo(0),
            store.get_block_height_synced_up_to().unwrap_or(0) + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    let stake_neuron = Transfer {
        from: account_identifier,
        to: AccountIdentifier::from_hex("b562a2afa304d08f7aaa42194459ff4c0e8ddb1596045a7b3b3396d97852f982").unwrap(),
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            stake_neuron,
            Memo(1678183231181200159),
            store.get_block_height_synced_up_to().unwrap_or(0) + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    let topup_neuron = Transfer {
        from: account_identifier,
        to: AccountIdentifier::from_hex("b562a2afa304d08f7aaa42194459ff4c0e8ddb1596045a7b3b3396d97852f982").unwrap(),
        amount: Tokens::from_tokens(3).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            topup_neuron,
            Memo(0),
            store.get_block_height_synced_up_to().unwrap_or(0) + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    let original_transaction_types: Vec<_> = store
        .get_transactions(
            principal,
            GetTransactionsRequest {
                account_identifier,
                page_size: 10,
                offset: 0,
            },
        )
        .transactions
        .into_iter()
        .map(|t| t.transaction_type)
        .collect();

    assert!(original_transaction_types.iter().all(|t| t.is_none()));

    store.add_account(principal);

    let transaction_types: Vec<_> = store
        .get_transactions(
            principal,
            GetTransactionsRequest {
                account_identifier,
                page_size: 10,
                offset: 0,
            },
        )
        .transactions
        .into_iter()
        .map(|t| t.transaction_type.unwrap())
        .collect();

    let expected_transaction_types = vec![
        TransactionType::TopUpNeuron,
        TransactionType::StakeNeuron,
        TransactionType::Transfer,
    ];
    for i in 0..expected_transaction_types.len() {
        assert_eq!(expected_transaction_types[i], transaction_types[i]);
    }
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
fn add_pending_transaction() {
    let buyer = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let swap_canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let mut store = setup_test_store();
    assert_eq!(0, store.pending_transactions.len());
    store.add_pending_transaction(PendingTransactionType::ParticipateSwap(swap_canister_id), buyer, TransactionType::ParticipateSwap);

    let account_identifier = AccountIdentifier::new(swap_canister_id.get(), Some((&buyer).into()));
    match store.get_pending_transaction(account_identifier) {
        None => {
            panic!("Pending transaction not found");
        }
        Some(pending_transaction) => {
            assert_eq!(pending_transaction.principal, buyer)
        }
    }
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
        RenameSubAccountRequest {
            account_identifier: sub_accounts[1].account_identifier,
            new_name: "BBB123".to_string(),
        },
    );

    assert!(matches!(result, RenameSubAccountResponse::Ok));

    let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

    assert_eq!("BBB123".to_string(), sub_accounts[1].name);
}

#[test]
fn register_hardware_wallet() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw2,
        },
    );

    assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
    assert!(matches!(res2, RegisterHardwareWalletResponse::Ok));

    let account = store.get_account(principal).unwrap();

    assert_eq!(2, account.hardware_wallet_accounts.len());
    assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
    assert_eq!("HW2", account.hardware_wallet_accounts[1].name);
    assert_eq!(
        AccountIdentifier::from(hw1),
        account.hardware_wallet_accounts[0].account_identifier
    );
    assert_eq!(
        AccountIdentifier::from(hw2),
        account.hardware_wallet_accounts[1].account_identifier
    );
}

#[test]
fn register_hardware_wallet_hardware_wallet_already_registered() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw1,
        },
    );

    assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
    assert!(matches!(
        res2,
        RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered
    ));

    let account = store.get_account(principal).unwrap();

    assert_eq!(1, account.hardware_wallet_accounts.len());
    assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
    assert_eq!(
        AccountIdentifier::from(hw1),
        account.hardware_wallet_accounts[0].account_identifier
    );
}

#[test]
fn hardware_wallet_transactions_tracked_correctly() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    let hw_principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw_account_identifier = AccountIdentifier::from(hw_principal);

    store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW".to_string(),
            principal: hw_principal,
        },
    );

    let transfer = Mint {
        amount: Tokens::from_tokens(1).unwrap(),
        to: hw_account_identifier,
    };
    store
        .append_transaction(
            transfer,
            Memo(0),
            store.get_block_height_synced_up_to().unwrap_or(0) + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    let transfer = Mint {
        amount: Tokens::from_tokens(2).unwrap(),
        to: hw_account_identifier,
    };
    store
        .append_transaction(
            transfer,
            Memo(0),
            store.get_block_height_synced_up_to().unwrap_or(0) + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    let get_transactions_request = GetTransactionsRequest {
        account_identifier: hw_account_identifier,
        offset: 0,
        page_size: 10,
    };

    let response = store.get_transactions(principal, get_transactions_request);

    assert_eq!(2, response.total);
    assert_eq!(5, response.transactions[0].block_height);
    assert_eq!(4, response.transactions[1].block_height);
}

#[test]
fn append_transaction_detects_neuron_transactions() {
    let mut store = setup_test_store();

    let block_height = store.get_block_height_synced_up_to().unwrap_or(0) + 1;

    let neuron_principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let neuron_memo = Memo(16656605094239839590);
    let neuron_account = AccountsStore::generate_stake_neuron_address(&neuron_principal, neuron_memo);

    let transfer = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            transfer,
            neuron_memo,
            block_height,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::StakeNeuron
    ));

    let notification = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(0).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            notification,
            Memo(block_height),
            block_height + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::StakeNeuronNotification
    ));

    let topup1 = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            topup1,
            Memo(0),
            block_height + 2,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::TopUpNeuron
    ));

    let topup2 = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(3).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            topup2,
            Memo(0),
            block_height + 3,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::TopUpNeuron
    ));
}

#[test]
fn append_transaction_detects_neuron_transactions_from_external_accounts() {
    let mut store = setup_test_store();

    let block_height = store.get_block_height_synced_up_to().unwrap_or(0) + 1;
    let neuron_principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let neuron_memo = Memo(16656605094239839590);
    let neuron_account = AccountsStore::generate_stake_neuron_address(&neuron_principal, neuron_memo);

    let transfer = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            transfer,
            neuron_memo,
            block_height,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::StakeNeuron
    ));

    let topup = Transfer {
        from: AccountIdentifier::new(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap(), None),
        to: neuron_account,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    let previous_transaction_count = store.transactions.len();
    store
        .append_transaction(
            topup,
            Memo(0),
            block_height + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();

    // No new transaction should have been added, but the neuron should be queued for refreshing
    assert_eq!(store.transactions.len(), previous_transaction_count);

    if let Some((_, MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }

    if let Some((_, MultiPartTransactionToBeProcessed::TopUpNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }
}

#[test]
fn topup_neuron_owned_by_other_principal_refreshes_balance_using_neurons_principal() {
    let mut store = setup_test_store();

    let neuron_principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let neuron_memo = Memo(16656605094239839590);
    let neuron_account = AccountsStore::generate_stake_neuron_address(&neuron_principal, neuron_memo);
    let other_principal = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();

    let block_height = store.get_block_height_synced_up_to().unwrap_or(0) + 1;
    let stake_neuron_transfer = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            stake_neuron_transfer,
            neuron_memo,
            block_height,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::StakeNeuron
    ));

    let topup = Transfer {
        from: AccountIdentifier::new(other_principal, None),
        to: neuron_account,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .append_transaction(
            topup,
            Memo(0),
            block_height + 1,
            TimeStamp::from_nanos_since_unix_epoch(100),
        )
        .unwrap();
    assert!(matches!(
        store.transactions.back().unwrap().transaction_type.unwrap(),
        TransactionType::TopUpNeuron
    ));

    if let Some((_, MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }

    if let Some((_, MultiPartTransactionToBeProcessed::TopUpNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }
}

#[test]
fn attach_canister_followed_by_get_canisters() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_ids: Vec<_> = [
        TEST_ACCOUNT_2,
        TEST_ACCOUNT_3,
        TEST_ACCOUNT_4,
        TEST_ACCOUNT_5,
        TEST_ACCOUNT_6,
    ]
    .iter()
    .map(|&id| CanisterId::from_str(id).unwrap())
    .collect();

    for (index, canister_id) in canister_ids.iter().enumerate() {
        let result = store.attach_canister(
            principal,
            AttachCanisterRequest {
                name: index.to_string(),
                canister_id: *canister_id,
            },
        );

        assert!(matches!(result, AttachCanisterResponse::Ok));
    }

    let canisters = store.get_canisters(principal);

    let expected: Vec<_> = canister_ids
        .into_iter()
        .enumerate()
        .map(|(index, canister_id)| NamedCanister {
            name: index.to_string(),
            canister_id,
        })
        .collect();

    assert_eq!(expected.len(), canisters.len());
    for i in 0..canisters.len() {
        assert_eq!(expected[i], canisters[i]);
    }
}

#[test]
fn attach_canister_name_already_taken() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::NameAlreadyTaken));
}

#[test]
fn attach_canister_name_too_long() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWX".to_string(),
            canister_id: canister_id1,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::NameTooLong));
}

#[test]
fn attach_canister_canister_already_attached() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::CanisterAlreadyAttached));
}

#[test]
fn canisters_ordered_by_name_if_exists_then_by_id() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();
    let canister_id3 = CanisterId::from_str(TEST_ACCOUNT_4).unwrap();
    let canister_id4 = CanisterId::from_str(TEST_ACCOUNT_5).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id: canister_id1,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id: canister_id3,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id: canister_id4,
        },
    );

    let canisters = store.get_canisters(principal);

    assert_eq!(4, canisters.len());
    assert_eq!(canister_id2, canisters[0].canister_id);
    assert_eq!(canister_id3, canisters[1].canister_id);
    assert_eq!(canister_id4, canisters[2].canister_id);
    assert_eq!(canister_id1, canisters[3].canister_id);
}

#[test]
fn detach_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id: canister_id2,
        },
    );

    let result = store.detach_canister(
        principal,
        DetachCanisterRequest {
            canister_id: canister_id1,
        },
    );

    assert!(matches!(result, DetachCanisterResponse::Ok));

    let canisters = store.get_canisters(principal);

    assert_eq!(1, canisters.len());
    assert_eq!(canister_id2, canisters[0].canister_id);
}

#[test]
fn detach_canister_canister_not_found() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );

    let result = store.detach_canister(
        principal,
        DetachCanisterRequest {
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result, DetachCanisterResponse::CanisterNotFound));

    let canisters = store.get_canisters(principal);

    assert_eq!(1, canisters.len());
    assert_eq!(canister_id1, canisters[0].canister_id);
}

#[test]
fn prune_transactions() {
    let mut store = setup_test_store();
    let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();

    let default_account = AccountIdentifier::from(principal1);
    let hw_principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw_account = AccountIdentifier::from(hw_principal);
    let unknown_account = AccountIdentifier::from(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap());

    let sub_account =
        if let CreateSubAccountResponse::Ok(response) = store.create_sub_account(principal2, "SUB1".to_string()) {
            response.account_identifier
        } else {
            panic!("Unable to create sub account");
        };

    store.register_hardware_wallet(
        principal1,
        RegisterHardwareWalletRequest {
            name: "HW".to_string(),
            principal: hw_principal,
        },
    );

    let timestamp = TimeStamp::from_nanos_since_unix_epoch(100);
    for _ in 0..10 {
        let transfer1 = Burn {
            amount: Tokens::from_e8s(100_000),
            from: default_account,
        };
        store
            .append_transaction(
                transfer1,
                Memo(0),
                store.get_block_height_synced_up_to().unwrap_or(0) + 1,
                timestamp,
            )
            .unwrap();

        let transfer2 = Transfer {
            amount: Tokens::from_e8s(10_000),
            from: default_account,
            to: sub_account,
            fee: Tokens::from_e8s(1_000),
        };
        store
            .append_transaction(
                transfer2,
                Memo(0),
                store.get_block_height_synced_up_to().unwrap() + 1,
                timestamp,
            )
            .unwrap();

        let transfer3 = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: hw_account,
        };
        store
            .append_transaction(
                transfer3,
                Memo(0),
                store.get_block_height_synced_up_to().unwrap() + 1,
                timestamp,
            )
            .unwrap();

        let transfer4 = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: unknown_account,
        };
        store
            .append_transaction(
                transfer4,
                Memo(0),
                store.get_block_height_synced_up_to().unwrap() + 1,
                timestamp,
            )
            .unwrap();
    }

    let original_block_heights = store.transactions.iter().map(|t| t.block_height).collect_vec();
    assert_eq!(20, store.prune_transactions(20));
    let pruned_block_heights = store.transactions.iter().map(|t| t.block_height).collect_vec();

    assert_eq!(
        original_block_heights[20..].iter().cloned().collect_vec(),
        pruned_block_heights
    );

    let mut transaction_indexes_remaining = Vec::new();
    for (_, account) in store.accounts.iter() {
        transaction_indexes_remaining.append(account.default_account_transactions.clone().as_mut());

        for sub_account in account.sub_accounts.values() {
            transaction_indexes_remaining.append(sub_account.transactions.clone().as_mut());
        }

        for hw_account in account.hardware_wallet_accounts.iter() {
            transaction_indexes_remaining.append(hw_account.transactions.clone().as_mut());
        }
    }

    transaction_indexes_remaining.sort_unstable();
    transaction_indexes_remaining.dedup();

    let block_heights_remaining = transaction_indexes_remaining
        .iter()
        .map(|t| store.get_transaction(*t).unwrap().block_height)
        .collect_vec();

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
    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWX".to_string(),
            principal: hw1,
        },
    );

    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string(),
            principal: hw2,
        },
    );

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
    assert_eq!(3, stats.block_height_synced_up_to.unwrap());
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

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_5).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_6).unwrap();
    store.register_hardware_wallet(
        principal3,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    store.register_hardware_wallet(
        principal4,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw2,
        },
    );

    let stats = store.get_stats();
    assert_eq!(2, stats.hardware_wallet_accounts_count);

    store.mark_ledger_sync_complete();
    let stats = store.get_stats();
    assert!(stats.seconds_since_last_ledger_sync < 10);
}

fn setup_test_store() -> AccountsStore {
    let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
    let account_identifier1 = AccountIdentifier::from(principal1);
    let account_identifier2 = AccountIdentifier::from(principal2);
    let mut store = AccountsStore::default();
    store.add_account(principal1);
    store.add_account(principal2);
    let timestamp = TimeStamp::from_nanos_since_unix_epoch(100);
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.append_transaction(transfer, Memo(0), 0, timestamp).unwrap();
    }
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.append_transaction(transfer, Memo(0), 1, timestamp).unwrap();
    }
    {
        let transfer = Burn {
            amount: Tokens::from_e8s(500_000_000),
            from: account_identifier1,
        };
        store.append_transaction(transfer, Memo(0), 2, timestamp).unwrap();
    }
    {
        let transfer = Transfer {
            amount: Tokens::from_e8s(300_000_000),
            fee: Tokens::from_e8s(1_000),
            from: account_identifier1,
            to: account_identifier2,
        };
        store.append_transaction(transfer, Memo(0), 3, timestamp).unwrap();
    }
    store
}
