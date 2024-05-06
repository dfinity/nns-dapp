use super::histogram::AccountsStoreHistogram;
use super::*;
use crate::accounts_store::toy_data::{toy_account, ToyAccountSize};
use crate::multi_part_transactions_processor::MultiPartTransactionToBeProcessed;
use icp_ledger::Tokens;
use pretty_assertions::assert_eq;
use std::str::FromStr;

const TEST_ACCOUNT_1: &str = "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe";
const TEST_ACCOUNT_2: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
const TEST_ACCOUNT_3: &str = "347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe";
const TEST_ACCOUNT_4: &str = "zrmyx-sbrcv-rod5f-xyd6k-letwb-tukpj-edhrc-sqash-lddmc-7qypw-yqe";
const TEST_ACCOUNT_5: &str = "2fzwl-cu3hl-bawo2-idwrw-7yygk-uccms-cbo3a-c6kqt-lnk3j-mewg3-hae";
const TEST_ACCOUNT_6: &str = "4gb44-uya57-c2v6u-fcz5v-qrpwl-wqkmf-o3fd3-esjio-kpysm-r5xxh-fqe";

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
fn maybe_process_transaction_detects_neuron_transactions() {
    let mut store = setup_test_store();

    let block_height = store.get_block_height_synced_up_to().unwrap_or(0) + 1;

    let neuron_principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let neuron_memo = Memo(16656605094239839590);
    let neuron_account = AccountsStore::generate_stake_neuron_address(&neuron_principal, neuron_memo);

    let transfer = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&transfer, neuron_memo, block_height)
        .unwrap();

    if let Some((_, MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }

    let topup1 = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&topup1, Memo(0), block_height + 1)
        .unwrap();

    // The neuron should be queued for refreshing
    if let Some((_, MultiPartTransactionToBeProcessed::TopUpNeuron(principal, memo))) =
        store.multi_part_transactions_processor.take_next()
    {
        assert_eq!(principal, neuron_principal);
        assert_eq!(memo, neuron_memo);
    } else {
        panic!();
    }

    let topup2 = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(3).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&topup2, Memo(0), block_height + 2)
        .unwrap();

    // The neuron should be queued for refreshing
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
fn maybe_process_transaction_detects_neuron_transactions_from_external_accounts() {
    let mut store = setup_test_store();

    let block_height = store.get_block_height_synced_up_to().unwrap_or(0) + 1;
    let neuron_principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let neuron_memo = Memo(16656605094239839590);
    let neuron_account = AccountsStore::generate_stake_neuron_address(&neuron_principal, neuron_memo);

    let transfer = Transfer {
        from: AccountIdentifier::new(neuron_principal, None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&transfer, neuron_memo, block_height)
        .unwrap();

    let topup = Transfer {
        from: AccountIdentifier::new(PrincipalId::from_str(TEST_ACCOUNT_4).unwrap(), None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&topup, Memo(0), block_height + 1)
        .unwrap();

    // The neuron should be queued for refreshing
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
        spender: None,
        amount: Tokens::from_tokens(1).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&stake_neuron_transfer, neuron_memo, block_height)
        .unwrap();

    let topup = Transfer {
        from: AccountIdentifier::new(other_principal, None),
        to: neuron_account,
        spender: None,
        amount: Tokens::from_tokens(2).unwrap(),
        fee: Tokens::from_e8s(10000),
    };
    store
        .maybe_process_transaction(&topup, Memo(0), block_height + 1)
        .unwrap();

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
fn attach_canister_substitutes_empty_name_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id,
        },
    );

    let initial_canisters = store.get_canisters(principal);
    assert!(initial_canisters[0].name.is_empty());

    let name = "XYZ";
    let result = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.to_string(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(name, canisters[0].name);
    assert!(matches!(result, AttachCanisterResponse::Ok));
}

#[test]
fn attach_newly_created_canister_attaches_if_not_present() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let canisters = store.get_canisters(principal);
    assert_eq!(canisters.len(), 0);

    store.attach_newly_created_canister(principal, canister_id);

    let final_canisters = store.get_canisters(principal);
    assert_eq!(final_canisters.len(), 1);
}

#[test]
fn attach_newly_created_canister_does_not_attach_if_present() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let name = "XYZ";
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.to_string(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(canisters.len(), 1);

    store.attach_newly_created_canister(principal, canister_id);

    let final_canisters = store.get_canisters(principal);
    assert_eq!(final_canisters.len(), 1);
    assert_eq!(final_canisters[0].name, name);
}

#[test]
fn attach_canister_and_rename() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let initial_name = "ABC".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: initial_name.clone(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(initial_name, canisters[0].name);

    let final_name = "DEF".to_string();
    store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: final_name.clone(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(final_name, canisters[0].name);
}

#[test]
fn rename_to_taken_name_fails() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let name1 = "ABC".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name1.clone(),
            canister_id,
        },
    );
    let name2 = "DEF".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name2.clone(),
            canister_id: canister_id2,
        },
    );
    let canisters = store.get_canisters(principal);
    assert_eq!(name1, canisters[0].name);
    assert_eq!(name2, canisters[1].name);

    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: name1.clone(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(response, RenameCanisterResponse::NameAlreadyTaken));

    let canisters = store.get_canisters(principal);
    assert_eq!(name1, canisters[0].name);
    assert_eq!(name2, canisters[1].name);
}

#[test]
fn rename_to_long_name_fails() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let long_name = "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string();
    let name = "DEF".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.clone(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: long_name,
            canister_id,
        },
    );
    let canisters = store.get_canisters(principal);
    assert_eq!(name, canisters[0].name);
    assert!(matches!(response, RenameCanisterResponse::NameTooLong));
}

#[test]
fn rename_not_found_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "DEF".to_string(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );
    assert!(matches!(response, RenameCanisterResponse::CanisterNotFound));
}

#[test]
fn rename_not_found_account() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "DEF".to_string(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal2,
        RenameCanisterRequest {
            name: "ABC".to_string(),
            canister_id,
        },
    );
    assert!(matches!(response, RenameCanisterResponse::AccountNotFound));
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

/// Test that the stats are as expected for a new test store.
pub(crate) fn assert_initial_test_store_stats_are_correct(stats: &Stats) {
    assert_eq!(2, stats.accounts_count);
    assert_eq!(0, stats.sub_accounts_count);
    assert_eq!(0, stats.hardware_wallet_accounts_count);
    assert_eq!(3, stats.block_height_synced_up_to.unwrap());
    assert!(stats.seconds_since_last_ledger_sync > 1_000_000_000);
}

/// The stats test should reject an empty response when we know that there is data in the accounts store.
#[test]
#[should_panic]
fn stats_test_should_fail_for_default_fill() {
    let stats = Stats::default();
    assert_initial_test_store_stats_are_correct(&stats);
}

#[test]
fn get_stats() {
    let mut store = setup_test_store();

    let mut stats = crate::stats::Stats::default();
    store.get_stats(&mut stats);
    assert_initial_test_store_stats_are_correct(&stats);

    let principal3 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let principal4 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    store.add_account(principal3);
    store.add_account(principal4);

    store.get_stats(&mut stats);

    assert_eq!(4, stats.accounts_count);

    for i in 1..10 {
        store.create_sub_account(principal3, i.to_string());
        store.get_stats(&mut stats);
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

    store.get_stats(&mut stats);
    assert_eq!(2, stats.hardware_wallet_accounts_count);

    store.mark_ledger_sync_complete();
    store.get_stats(&mut stats);
    assert!(stats.seconds_since_last_ledger_sync < 10);
}

/// Tests that `get_histogram()` returns correct values.
///
/// The test creates an account store and adds data, mirroring the test for `get_stats()`
/// exactly, and verifies that the histogram is as expected after every change.
#[test]
fn get_histogram() {
    let mut store = AccountsStore::default();

    // Initially the histogram should be empty.
    {
        let expected_histogram = AccountsStoreHistogram::default();
        let histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, histogram,
            "Histogram of an empty accounts store should be empty"
        );
    }

    // If we populate (or rather replace) the db with the standard test data, we should get a corresponding histogram:
    store = setup_test_store();
    let mut expected_histogram = test_store_histogram();
    {
        let histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, histogram,
            "Histogram of a standard test store may need to be updated"
        );
    }

    let principal3 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let principal4 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    // Adding accounts should be accounted for correctly.  Pun intended.
    {
        store.add_account(principal3);
        store.add_account(principal4);

        // These new accounts are empty, so the 0 bucket should be incremented in each histogram:
        expected_histogram.accounts_count += 2;
        *expected_histogram.sub_accounts(0) += 2;
        *expected_histogram.hardware_wallet_accounts(0) += 2;
        *expected_histogram.canisters(0) += 2;

        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Adding accounts is not accounted for correctly"
        );
    }

    // Sub-accounts should be counted correctly:
    for i in 0..10 {
        store.create_sub_account(principal3, i.to_string());

        // The histogram entry for the number of sub-accounts will have changed from 0 to 1, 2 etc for one account:
        *expected_histogram.sub_accounts(i) -= 1;
        *expected_histogram.sub_accounts(i + 1) += 1;
        // Check:
        let actual_histogram = store.get_histogram();
        expected_histogram.remove_empty_buckets();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Adding the {}'th subaccount is not accounted for correctly",
            i
        );
    }

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_5).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_6).unwrap();
    // Hardware wallets should be counted correctly
    {
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
        // The two accounts (principal3 and principal4) have 1 hardware wallet each, so the 1 bucket should be incremented in each histogram:
        *expected_histogram.hardware_wallet_accounts(0) -= 2;
        *expected_histogram.hardware_wallet_accounts(1) += 2;

        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Hardware wallets are not counted correctly"
        );
    }

    // Canisters should be counted corerctly.
    for canister_index in 0..3 {
        let canister_id = CanisterId::from(canister_index);
        let attach_canister_request = AttachCanisterRequest {
            name: format!("canister_{canister_index}"),
            canister_id,
        };
        store.attach_canister(principal4, attach_canister_request);
        *expected_histogram.canisters(canister_index as usize) -= 1;
        *expected_histogram.canisters(canister_index as usize + 1) += 1;
        expected_histogram.remove_empty_buckets();
        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Canisters are not counted correctly"
        );
    }
}

pub(crate) fn setup_test_store() -> AccountsStore {
    let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
    let account_identifier1 = AccountIdentifier::from(principal1);
    let account_identifier2 = AccountIdentifier::from(principal2);
    let mut store = AccountsStore::default();
    store.add_account(principal1);
    store.add_account(principal2);
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 0).unwrap();
    }
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 1).unwrap();
    }
    {
        let transfer = Burn {
            amount: Tokens::from_e8s(500_000_000),
            from: account_identifier1,
            spender: None,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 2).unwrap();
    }
    {
        let transfer = Transfer {
            amount: Tokens::from_e8s(300_000_000),
            fee: Tokens::from_e8s(1_000),
            spender: None,
            from: account_identifier1,
            to: account_identifier2,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 3).unwrap();
    }
    store
}

/// The histogram corresponding to a test store.
///
/// Compare with the `setup_test_store()` function to verify that this is the expected histogram;
/// if that changes, these stats are likely to change as well.
pub fn test_store_histogram() -> AccountsStoreHistogram {
    let mut ans = AccountsStoreHistogram::default();
    ans.accounts_count = 2;
    *ans.sub_accounts(0) += 2; // Neither test account has sub-accounts.
    *ans.hardware_wallet_accounts(0) += 2; // Neither test account has hardware wallets.
    *ans.canisters(0) += 2; // Neither test account has canisters.
    ans
}

/// Stored accounts should be recovered with the same value.
///
/// Note: Given that account implement `CandidType` this is little more than a formality.
#[test]
fn accounts_should_implement_storable() {
    let account = toy_account(
        1,
        ToyAccountSize {
            sub_accounts: 2,
            canisters: 3,
            default_account_transactions: 4,
            sub_account_transactions: 5,
            hardware_wallets: 6,
        },
    );
    let bytes = account.to_bytes();
    let parsed = Account::from_bytes(bytes);
    assert_eq!(account, parsed);
}


#[test]
fn decode_old() {
  let hex_bytes = "4449444c336d016c02000201036d7b6c06ae9db1900104fbdb8cd20971ec80e5e9090595e9ae990a07e5e4e7c70b0985f280810e0a6e686d066c02cbe4fdc70471b3c4b1f204686d086c03ae9db1900168cbe4fdc70471d581cdb40c096d786d0b6c02007b010c6c03cbe4fdc70471fbdb8cd20971d581cdb40c096d0e6c020071010f6b02added2a30110e1c9d3bf0e116c020071017b6d716d136c02001401156c02007101716c02001601786b0badfaedfb017fef80e5df027fc2f5d599037fb8a9adde047ff7fcdafa0568f1e4e08c0768e3ea92cb097fcbd6fda00b7fc3918ab80c7fad84f4e20c7fd5fce8ea0e7f6d186c06fbcfc8f40119b1fde7a40478ba89e5c20478d6a9bbae0a1ad9afeeac0d78abdeb6d30d1b6e166c01d6f68e8001786b05adfaedfb011cef80e5df021fc2f5d5990320cbd6fda00b21d5fce8ea0e226c05c6fcb6021deaca8a9e0471d8bbb2840c7cdea7f7da0d1ecb96dcb40e716c01e0a9b302786e1a6c02eaca8a9e0471d8a38ca80d1d6c02fbca0171d8a38ca80d1d6c04fbca0171c6fcb6021deaca8a9e0471d8a38ca80d1d6c05fbca0171c6fcb6021deaca8a9e0471d8a38ca80d1dcb96dcb40e716d246c02007101256c04ae9db1900168ba89e5c20478fbdb8cd20971e7b6e3e80f266e786c01919baaef05286d296c020078012a6b08bfbe9da00468f7fcdafa052bf1e4e08c072ce3ea92cb092da6f08fa60b2ec3918ab80c2fad84f4e20c2fd3aaf38a0f306c04ae9db1900168adcff6d80271b3c4b1f20468d8a38ca80d1d6c0400680171027103686c039cb1fa2568adcff6d80271d8a38ca80d1d6c06adcff6d8027190c6c196057188df89b907689994cdc6090288c6c7be0b78d8a38ca80d1d6c02006801786c02006801686e326c02d5ad9bae0178e5bccdb906780a000d12172326277878310010403763363562373265306135323730353131666435336136613466383561616436623031316362616433613166383132636235336565353362323934303963636300403564626564633865643865313230646233646533333561396330373437356662613664373366613965343566653735663861336466353966363165353830646302403131386666303964653737663536393961303164346263333966333738343937323062393437663134626464363637313364323366633666343536363434366300403338393864633433633039343430353437666435346239656139393966646666303238313436643838626338663562646264623764633962313261653633316401403763626432666364653032663531646564303061626532373664333264623265656139623136326234383935393764323331353537303933646239383462613600403338393864633433633039343430353437666435346239656139393966646666303238313436643838626338663562646264623764633962313261653633316403406464396432393230626534653462316133353635323839626139363635643862393861626564323932386362303735633966373963326631326133626632366600403638633061346162323635353238363363373134363362636565643461353034633935653064373666646437613132643138626366303866313736353736313002403163646462313163336332333161393337626134663066303433313535623037636563313131336665313861386133343532336131393263373939386635323401014034323466396262393866656139303664333164313761373032393531613662386636616231303964653131326664316431353533663636616639633266393361406630613130373962323464363835333137653830353961356439383265383037393133313362323033633430656663333562613766383464383536353564613300403564626564633865643865313230646233646533333561396330373437356662613664373366613965343566653735663861336466353966363165353830646301403738353264313866613832666637633137643035613761656362653130373662383635623834663666333138373164613735313331303730383933633636363300403564626564633865643865313230646233646533333561396330373437356662613664373366613965343566653735663861336466353966363165353830646303403835633961346433376438626636303563333566336235376233386234353035363533363162343338373030313861616438336538396336303966646339383500406233373230386431643739653135363532323265663564616664613966323666353036633436396631313961346661363861663636353935623234633537633202406639356462346638653164326138313337626535626462383238336435643330393263313331663438326265326634383464303439373936616632633565323001014035646265646338656438653132306462336465333335613963303734373566626136643733666139653435666537356638613364663539663631653538306463403039346533653363383361313034646563666361303131323862313036363032353430383532323539336438333962346139346565613031633562346635333600406233373230386431643739653135363532323265663564616664613966323666353036633436396631313961346661363861663636353935623234633537633201406538313764666535643862626665663835333166643864333433373538666264313065323233333331366563353434343065363435333763366438303330373000403432346639626239386665613930366433316431376137303239353161366238663661623130396465313132666431643135353366363661663963326639336101406564356462396333326332313438336636636138303836623963343162323466333238373139633563646163373463326261366161386239653164633264636601014033383938646334336330393434303534376664353462396561393939666466663032383134366438386263386635626462646237646339623132616536333164403361653937343634623664623031616134333538633464663336653563336532323863336236326662376639326333373234633261363431303835623834383200406266336137353966343632633236343130653935376337383163393733383265376637623861393864646632623066623033343237383163386566613536666301406138376430636233386535653234626532656235663832343566363739633437643761373837653034386363336263313630646564646266396537613535626101014062663361373539663436326332363431306539353763373831633937333832653766376238613938646466326230666230333432373831633865666135366663406138383532313961346139663065396133623965353834643231633031663963653066336239343066386230323739323236626633653635636335623536643900403338393864633433633039343430353437666435346239656139393966646666303238313436643838626338663562646264623764633962313261653633316402403937636137616631663834313732653335623765346539653661616230356634316230333837633666366364343631333139306634333538613864323334303400403638633061346162323635353238363363373134363362636565643461353034633935653064373666646437613132643138626366303866313736353736313001001b010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000010709000000000000000b0000000000000055010000000000000a00000000000000034065306462316165323538633463383332613835376632653165623139336437353833303137633234356463666236633236653437316538353036303037356438112700000000000040616536633736383030383936636231383262343864663531333035643933633530656162666465656165333261313334636334396531343835376466393462351027000000000000034033383938646334336330393434303534376664353462396561393939666466663032383134366438386263386635626462646237646339623132616536333164010a0a00000000000000fe010b000000000000004039613132363230343131386132313733386533343637333964303135353761366537663633353364626333363432386239303431626431343737366466656534010c000000000000004062333732303864316437396531353635323232656635646166646139663236663530366334363966313139613466613638616636363539356232346335376332010a0a00000000000000fe010b000000000000004039613132363230343131386132313733386533343637333964303135353761366537663633353364626333363432386239303431626431343737366466656534010c000000000000004032396365353438643464393066623439663134333331653361353335393836346162623536643730633030346462653034353835323463313334616532623436010a0a00000000000000fe010b000000000000004039613132363230343131386132313733386533343637333964303135353761366537663633353364626333363432386239303431626431343737366466656534010c00000000000000000000000000000000000000000000000000010c000000000000000400000000000000";
  let bytes = hex::decode(hex_bytes).unwrap();
  let (
      _1,
      _2,
      _3,
      _4,
      _5,
      _6,
      _7,
      _8,
      _9,
      _10,
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
  ) = Candid::from_bytes(bytes).map(|c| c.0).unwrap();
}

crate::accounts_store::schema::tests::test_accounts_db!(AccountsStore::default());
